# 0001. Pages are prerendered to HTML at build time

Date: 2026-11-17 · Status: accepted

## Context
The site was a single page drawn in the browser: without JavaScript a visitor or a search engine got only
meta tags. Players and pages had no addresses of their own, so nothing could be shared or found.

## Decision
Keep React + Vite and add **prerendering**: `npm run build` (`scripts/build.mjs`) builds the site as before,
then renders every address (`prerenderPaths()` in `src/routes.ts`) to ready-made HTML with its own `<head>`.
In the browser React takes that HTML over (hydration) and the site works as before.
Routing is `react-router` (library mode). Pages are written as `rating.html`, `players/walle.html`;
Vercel serves them at clean addresses (`vercel.json`: `cleanUrls`).

## Why not the alternatives
- **Next.js / server rendering on each request**: the same result for search engines, but it means
  rewriting the whole project and paying for a server. All our data changes at most once a day
  (the daily sync rebuilds the site), so rendering once per build is enough.
- **A prerender service / headless browser at build time**: slower, flakier, and an extra dependency.

## Consequences
- Anything that depends on the visitor's clock or browser (next game, "today", saved language) must not
  change the first render. `useHydrated()` / `useClubNow()` give the build-time value first, the real one
  right after. Breaking this shows up as React error #418 in the console.
- Entrance animations hide content only when JS runs (`html.js` class), so the HTML is readable without JS.
- New data needs a rebuild to appear; the daily sync and every merge already do that.
- If we ever need per-request data (live sign-ups from the bot, slice 4), that part is fetched by a
  small Vercel function or in the browser, not by rebuilding.
