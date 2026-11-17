# 0004. The club rating is mirrored from iMafia into a JSON file in the repository

Date: 2026-11-18 · Status: accepted

## Context
The rating lives on imafia.org (club 35). iMafia has no public API; its own club page loads tables from
`POST /aiax/main/club_rating`, which returns ready HTML rows. We want the rating on our site, with
position changes, and the player of the month computed from it.

## Decision
- `scripts/sync-rating.mjs` runs once a day (GitHub Actions, 05:00 UTC). It reads the club page, then each
  league × season table (~15 requests, 1.5 s apart, User-Agent naming this repository), and writes
  `src/data/rating.json`. The site reads only that file.
- Parsing lives in `scripts/lib/imafia.mjs` and is tested on saved pages (`scripts/__fixtures__`). If iMafia
  changes its markup, the tests and the sync fail loudly instead of publishing an empty table.
- Arrows: each table keeps the places from before its last change (`prev`), so an unchanged day keeps them.
- Player of the month: first place of the Month Rating at the first sync after the month ends, written to
  `src/data/winners.json` once and never overwritten.
- If a sync fails, nothing is committed: the site keeps the last good data and shows its date.

## Why JSON in the repository and not a database (Supabase etc.)
- Free, no keys or accounts, nothing to keep running.
- Git history is the archive of every day's rating; the arrows need only the previous state.
- The data changes once a day, and every change rebuilds the site (ADR 0001), so prerendered pages
  always show current numbers.
- Downside: the rating updates once a day, not live. A database becomes worth it only for live data
  (e.g. sign-ups from the bot).
