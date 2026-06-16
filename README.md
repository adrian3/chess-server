# Chess Server

Play chess against real people around the world — free, with nothing to download.

### ▶ Play now: **https://adrian3.github.io/chess-server/**

## What is it?

Chess Server is a simple, friendly way to play live chess on
[FICS](https://www.freechess.org) (the Free Internet Chess Server) right from your
web browser — on your phone, tablet, or computer. No sign-up required: jump in as a
guest, or log in with a free FICS account if you have one.

## How to play

1. Open **https://adrian3.github.io/chess-server/**.
2. Tap **Guest** (or **Registered User** to log in).
3. From there you can:
   - **Create New Game** — pick your time control and color, then find an opponent.
   - **View Open Tables** — join a game someone else is waiting to play.
   - **Watch Top Players** — observe live games by strong players.
4. Drag and drop pieces to move. That's it — have fun!

> **First connection feels slow?** That's normal. The game server goes to sleep when
> no one's using it and takes up to a minute to wake up. You'll see a "please wait"
> message — just hang on and it'll connect.

## Install it like an app

You can add Chess Server to your device so it opens in its own window with its own
icon, just like an app from the store:

- **iPhone / iPad (Safari):** tap **Share** → **Add to Home Screen**.
- **Android (Chrome):** tap the **⋮** menu → **Install app** (or **Add to Home screen**).
- **Computer (Chrome / Edge):** click the **Install** icon in the address bar, or
  open the **⋮** menu → **Install Chess Server**.

Once installed, it launches full-screen with the chess icon and works just like the
website.

## Good to know

- It's completely **free and ad-free**.
- You need an **internet connection** to play (games happen live on FICS). If you go
  offline, the app will let you know.

---

### For the curious (how it's built)

It's a static web app hosted on GitHub Pages, plus a small relay service (on Render)
that connects your browser to the FICS chess server. Developer and deployment notes
are in [`server/DEPLOY.md`](server/DEPLOY.md).
