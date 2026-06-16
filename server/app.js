'use strict';
// FICS relay: bridges browser WebSocket <-> raw TCP telnet to freechess.org.
// Runs as a Phusion Passenger Node app on DreamHost. Static files (the chess UI)
// are served by Passenger from ./public; this process only handles the /ws upgrade.
//
// The TCP target is hardcoded so this can never be used as an open proxy to
// arbitrary hosts -- it only ever talks to FICS.

const http = require('http');
const net = require('net');
const WebSocket = require('ws');

const FICS_HOST = 'freechess.org';
const FICS_PORT = 5000;
const WS_PATHS = ['/ws', '/chess/ws']; // accept either, depending on how the app is mounted

const server = http.createServer((req, res) => {
  // Only the /ws WebSocket route matters; reply 200 on / and /health so Render's
  // health check passes and a plain browser visit shows the relay is alive.
  const path = (req.url || '').split('?')[0];
  if (path === '/' || path === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('FICS relay alive. Connect a WebSocket to /ws');
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const path = (req.url || '').split('?')[0];
  if (WS_PATHS.indexOf(path) === -1) {
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  const tcp = net.connect(FICS_PORT, FICS_HOST);
  let tcpOpen = false;
  const pending = []; // bytes the browser sent before the TCP socket finished connecting

  tcp.on('connect', () => {
    tcpOpen = true;
    while (pending.length) tcp.write(pending.shift());
  });
  tcp.on('data', (buf) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(buf);
  });
  tcp.on('close', () => { try { ws.close(); } catch (e) {} });
  tcp.on('error', () => { try { ws.close(); } catch (e) {} });

  ws.on('message', (data) => {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    if (tcpOpen) tcp.write(buf);
    else pending.push(buf);
  });
  ws.on('close', () => { try { tcp.destroy(); } catch (e) {} });
  ws.on('error', () => { try { tcp.destroy(); } catch (e) {} });
});

// Passenger patches listen() and supplies the bind target; the port here is only
// used if you run the file directly with `node app.js` for local testing.
server.listen(process.env.PORT || 5050);
