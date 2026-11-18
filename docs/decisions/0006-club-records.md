# 0006. Club records are worked out from iMafia's monthly ratings

Date: 2026-11-18 · Status: accepted

## Context
The club wants six records, and only these: most games in a month, most points in a month, most extra
points in a month, best extra points per game in a month, most wins in a month, and most times MVP of
the month. The rating mirror (0004) already stores every monthly table iMafia shows.

## Decision
- `src/data/records.ts` computes the records from the seasons that have a month; annual and all-time
  tables are ignored. No new data or sync step.
- "Per game" counts only players above iMafia's too-few-games line, so one lucky game is not a record.
- MVP of the month is iMafia's first MVP nominee of each monthly table.
- Ties are shown together. Values are compared at two decimals, as iMafia shows them.
- Shown under the rating table on `/rating`, the same for every league and season.

## Consequences
- Records go back only as far as the monthly tables in iMafia's filter (now March 2026). If iMafia ever
  drops old months from the filter, a record set then would disappear; we would then freeze records the
  way winners.json freezes players of the month.
- The current month counts too, so a record can be set mid-month and grow until the month ends.
