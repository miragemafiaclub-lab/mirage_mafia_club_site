# 0007. Tournament calendar: upcoming tournaments with club members, from iMafia and MafGame

Date: 2026-11-18 · Status: accepted

## Context
The club asked for a page of upcoming tournaments that its ЧК (full members) are registered for, from the
«Турниры» sections of imafia.org and mafgame.org, filtered «Европа» (default) / «Онлайн» / «Все», about
three months ahead. Neither site has a public API.

## Where the sites show registrations
- **iMafia**: `/tournaments` (default filter «Заплановані», 12 per page) lists upcoming tournaments with the
  first day, a short location and iMafia's region (`Warsaw, Європа`; region `Swipeal` = online). Each
  `/tournament/<id>` page has the full dates and a «Учасники» tab with players under «Підтверджені»
  (confirmed) and «Відхилені» (rejected, skipped), linked by iMafia id (`/u/<id>`).
- **MafGame**: `/tournaments?s=planned` (Inertia JSON, 10 per page) gives city, country (English) and an
  online flag. `/tournaments/<id>/participants` gives `players` (on the list) and, when the organiser shows
  them, `applications`. Some tournaments show an empty list to visitors who are not logged in.

## Decision
- `scripts/sync-tournaments.mjs` runs daily after the podium sync (≈ 25 iMafia + ≈ 40 MafGame pages, one at
  a time, 0.7 s apart). Parsers live in `scripts/lib/tournaments.mjs`, tested on trimmed saved pages.
- Our players: ЧК from `src/data/players.ts` (`GROUPS` in the script; КЧК can be added there). iMafia matches
  by iMafia id (from `player-index.json`); MafGame by nick plus club 62 or the same first name, like the podium.
- Place: online when the source says so. Otherwise the country comes from MafGame, or for iMafia from a
  small city list (`CITIES` in `scripts/lib/tournaments.mjs`). «Европа» = the `EUROPE` set there: EU, EEA, UK,
  Switzerland, the Western Balkans, Ukraine and Moldova. Unknown country, or anywhere else (Israel, Türkiye,
  Georgia, USA…), shows under «Все» only. iMafia's own «Європа» region is not trusted: it includes Israel.
- Dates are the calendar days the organisers give (the sources have no times).
- `src/data/tournaments.json` is rewritten only when the list changes; `updated` is the day it last changed.
- Failure never stops the daily job: a source that cannot be read keeps its previous entries, the script
  exits 0 with a warning, and the workflow step has `continue-on-error: true`.

## Consequences
- A tournament appears once a member is on its list; MafGame lists hidden from anonymous visitors are missed.
- New tournament towns on iMafia land under «Все» until added to `CITIES`.
- The header has no room for a ninth item between 1361 and 1600 px (Russian overflows by up to 81 px), so
  the page is linked from the footer and the rating page instead.
