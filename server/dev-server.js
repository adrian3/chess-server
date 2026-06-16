'use strict';
// Local development server: serves the static UI from the repo root AND provides
// the /ws FICS relay on the same origin, so you can run the whole app locally with
//   cd server && npm install && node dev-server.js
// then open http://localhost:5050/  (NOT for production — DreamHost uses Passenger
// with app.js; see DEPLOY.md).

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 5050;
const FICS_HOST = 'freechess.org';
const FICS_PORT = 5000;

const TYPES = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  if ((req.url || '').split('?')[0] !== '/ws') { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws));
});
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  const tcp = net.connect(FICS_PORT, FICS_HOST);
  let open = false; const pending = [];
  tcp.on('connect', () => { open = true; while (pending.length) tcp.write(pending.shift()); });
  tcp.on('data', (b) => { if (ws.readyState === WebSocket.OPEN) ws.send(b); });
  tcp.on('close', () => { try { ws.close(); } catch (e) {} });
  tcp.on('error', () => { try { ws.close(); } catch (e) {} });
  ws.on('message', (d) => { const b = Buffer.isBuffer(d) ? d : Buffer.from(d); open ? tcp.write(b) : pending.push(b); });
  ws.on('close', () => { try { tcp.destroy(); } catch (e) {} });
  ws.on('error', () => { try { tcp.destroy(); } catch (e) {} });
});

// Heartbeat: terminate clients that miss a pong (gone without a clean close) so
// their FICS sockets get cleaned up. Mirrors app.js.
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) { ws.terminate(); return; }
    ws.isAlive = false;
    try { ws.ping(); } catch (e) {}
  });
}, 30000);
wss.on('close', () => clearInterval(heartbeat));

server.listen(PORT, () => console.log('dev server on http://localhost:' + PORT));
