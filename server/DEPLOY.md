# Deploying: UI on GitHub Pages + relay on Render

The app is split across two free-friendly hosts:

- **UI** — the static files in the repo root, served by **GitHub Pages**.
- **Relay** — `server/app.js`, a WebSocket↔TCP bridge to `freechess.org:5000`,
  running as a **Render** web service.

```
Browser ── https ──▶ GitHub Pages (static UI)
   │
   └── wss ──▶ Render (server/app.js) ── TCP ──▶ freechess.org:5000
```

Both are HTTPS/WSS, so there's no mixed-content problem, and WebSocket connections
aren't subject to CORS — the two origins talk fine.

## 1. Deploy the relay on Render

1. Push this repo to GitHub (Render deploys from GitHub).
2. Render dashboard → **New → Web Service** → connect this repo. Then set:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node app.js`
   - **Instance Type:** Free
   (Or use **New → Blueprint** and let it read `render.yaml` at the repo root.)
3. Deploy. Render gives you a URL like `https://fics-relay-ab12.onrender.com`.
4. Sanity check: open that URL in a browser — it should say
   `FICS relay alive. Connect a WebSocket to /ws`.

Your WebSocket endpoint is that URL with `wss://` and `/ws`, e.g.
`wss://fics-relay-ab12.onrender.com/ws`.

> **Free-tier note:** Render free services sleep after ~15 min idle and take
> ~30–60s to wake. So the *first* "Guest" connection after a quiet spell is slow;
> once connected, play is normal. Upgrading to a paid instance removes the sleep.

## 2. Point the UI at your relay

Edit `js/websocket-socket.js` and replace the placeholder hostname with your Render
URL:

```js
var RELAY_URL = "wss://fics-relay-ab12.onrender.com/ws";
```

Commit and push.

## 3. Enable GitHub Pages

The repo must be **public** for free Pages (or you need a paid GitHub plan).

1. GitHub → repo → **Settings → Pages**.
2. **Source:** Deploy from a branch → **Branch:** `main` → **Folder:** `/ (root)` →
   Save.
3. After a minute the site is live at
   `https://<user>.github.io/<repo>/` (e.g. `https://adrian3.github.io/chess-server/`).
   The `.nojekyll` file at the repo root makes Pages serve everything as-is.

Open that URL, tap **Guest**, and you're on FICS.

## Local development

`server/dev-server.js` runs the whole thing on one origin for testing:

```bash
cd server && npm install && node dev-server.js
# open http://localhost:5050/  (the client auto-targets the local relay on localhost)
```

## Notes

- The relay's TCP target is hardcoded to FICS, so it can't be used as an open proxy.
- A custom domain (e.g. `play.adrian3.com/chess`) can later point at Pages via a
  CNAME if you'd prefer that over the `github.io` URL — the relay setup is unchanged.
