# 0005. Player stats come from iMafia profiles, a few profiles per day

Date: 2026-11-18 · Status: accepted

## Context
Profiles show win rate by role, first blood, awards and tournament prize places. iMafia has these only on
each player's page (`/u/<id>`), and one page is about 1.4 MB. The club rating has ~310 players:
fetching every profile daily would be ~430 MB a day from iMafia.

## Decision
- `scripts/sync-profiles.mjs` runs daily after the rating sync and fetches **at most 25 profiles**,
  2.5 s apart: first those never fetched (club members first), then players who played since their last
  fetch (their games count in the rating changed), then any profile older than 14 days.
- It keeps only what the site shows (`src/data/profiles.json`): role stats, first blood, cups, awards,
  the number of tournaments and the prize places (1–3). Guests' avatars are saved small
  (`public/players/<id>.jpg`, 480×640); club members use the club's own photos.
- One broken profile is skipped and keeps its old data; the run fails only if every fetch fails.
- The 80 most important profiles (all club members) were fetched once by hand; the rest arrive over ~10 days.

## How the data reaches the page (keeps the site fast)
The rating and profile data are **not** in the main script. The build embeds each page's own data in its
HTML and also writes it to `/data/…json`; moving between pages fetches that file (`src/pageData.tsx`).
Every page needs only `src/data/player-index.json` (~13 KB) to know who has a page.

## Consequences
- A player's role stats can be up to two weeks old if they did not play in the club; active players
  are refreshed the day after they play.
- Role numbers are for all the player's iMafia games, not only the club's (agreed with the club).
