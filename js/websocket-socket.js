// WebSocket shim that stands in for the old Cordova cordova-plugin-socket-tcp
// `Socket`. It exposes the same interface app.js already uses
// (.open / .write / .onData / .onError / .onClose) but tunnels bytes through a
// wss:// relay instead of a raw TCP socket, since browsers can't do raw TCP.
//
// onData delivers a Uint8Array, exactly like the old plugin did, so the FICS
// parsing in app.js is unchanged.

// Polyfill for the Cordova dialogs plugin (navigator.notification), which app.js
// calls in many places. Maps to native alert/confirm using the same signatures:
//   alert(message, callback, title, buttonName)
//   confirm(message, callback, title, buttonLabels) -> callback(1-based index)
if (!navigator.notification) {
  navigator.notification = {
    alert: function (message, callback, title) {
      window.alert((title ? title + ": " : "") + message);
      if (typeof callback === "function") callback();
    },
    confirm: function (message, callback, title) {
      var accepted = window.confirm((title ? title + ": " : "") + message);
      // Cordova reports button 1 for the first (affirmative) choice, 2 for the second.
      if (typeof callback === "function") callback(accepted ? 1 : 2);
    }
  };
}

// Relay endpoint. The UI is hosted on GitHub Pages and the relay runs on Render,
// so this points at the Render service.
var RELAY_URL = "wss://chess-server-tscr.onrender.com/ws";

// Local-dev convenience: when served from localhost (server/dev-server.js), use the
// local relay on the same origin instead of Render.
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  RELAY_URL = "ws://" + location.host + "/ws";
}

function Socket() {
  this.ws = null;
  this.onData = function () {};
  this.onError = function () {};
  this.onClose = function () {};
}

// host/port are ignored: the relay decides the real TCP target (freechess.org:5000).
Socket.prototype.open = function (host, port, success, failure) {
  var self = this;
  try {
    this.ws = new WebSocket(RELAY_URL);
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = function () {
      if (typeof success === "function") success();
    };
    this.ws.onmessage = function (event) {
      if (typeof event.data === "string") {
        // shouldn't happen with the binary relay, but handle it gracefully
        var s = event.data;
        var arr = new Uint8Array(s.length);
        for (var i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i) & 0xff;
        self.onData(arr);
      } else {
        self.onData(new Uint8Array(event.data));
      }
    };
    this.ws.onerror = function () {
      if (typeof self.onError === "function") self.onError("WebSocket error");
      if (typeof failure === "function") failure("WebSocket error");
    };
    this.ws.onclose = function (event) {
      if (typeof self.onClose === "function") self.onClose(!event.wasClean);
    };
  } catch (e) {
    if (typeof failure === "function") failure(e.message || String(e));
  }
};

Socket.prototype.write = function (bytes) {
  if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    this.ws.send(bytes); // Uint8Array -> binary frame
  }
};

// Kept for interface compatibility; no-ops for a WebSocket.
Socket.prototype.shutdownWrite = function () {};
Socket.prototype.close = function () {
  if (this.ws) this.ws.close();
};
