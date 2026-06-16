# Chess Server

A browser-based client for playing chess on [FICS](http://www.freechess.org)
(the Free Internet Chess Server). Originally a Cordova/iOS app; now a plain web app.

## How it works

FICS only speaks raw telnet on `freechess.org:5000`, and browsers can't open raw TCP
sockets. So the app connects through a small **WebSocket↔TCP relay**:

```
Browser (GitHub Pages) ── wss ──▶ relay (Render) ── TCP ──▶ freechess.org:5000
```

- `index.html` + `js/` + `css/` — the static UI (jQuery / jQTouch / chessboard.js /
  chess.js). No build step; `index.html` loads `js/app.js` directly.
- `js/websocket-socket.js` — a shim exposing the same interface the old Cordova TCP
  plugin did (`.open/.write/.onData/...`), but tunneling through the relay. Set your
  relay URL (`RELAY_URL`) here.
- `server/` — the relay (`app.js`), a local dev server (`dev-server.js`), and
  deployment instructions (`DEPLOY.md`).

## Hosting

- **UI:** GitHub Pages (repo must be public for the free tier).
- **Relay:** Render web service (free tier; sleeps when idle, ~30–60s cold start).

Full step-by-step in [server/DEPLOY.md](server/DEPLOY.md).

## Local development

```bash
cd server && npm install && node dev-server.js
# open http://localhost:5050/  — serves the UI and the relay on one origin
```

## Notes

- The relay's TCP target is hardcoded to FICS, so it can't be used as an open proxy.
- The relay code is host-agnostic — it also runs on any platform that allows a
  persistent Node process (Fly.io, a VPS, etc.), not just Render.
