// Service worker for the Chess Server PWA. Caches the app shell so the installed
// app loads instantly and the UI opens offline. (Playing still needs the network:
// the WebSocket relay / FICS can't be cached.) Bump CACHE to ship an update.
const CACHE = 'chess-server-v1';

const CORE = [
  'index.html',
  'manifest.json',
  'css/normalize.css',
  'css/styles.css',
  'css/chessboard-0.3.0.css',
  'css/innsbruck.min.css',
  'js/jquery-2.1.1.min.js',
  'js/jquery.easing.1.3.js',
  'js/jqt.min.js',
  'js/jqtouch-jquery.min.js',
  'js/fastclick.js',
  'js/chessboard-0.3.0.min.js',
  'js/chess.min.js',
  'js/websocket-socket.js',
  'js/app.js',
  'js/availableGames.js',
  'js/tests.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle same-origin GETs; WebSocket upgrades and cross-origin requests pass through.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Network-first for page navigations so a new deploy shows up when online,
  // falling back to the cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('index.html')))
    );
    return;
  }

  // Cache-first for static assets, with runtime caching of anything new.
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});
