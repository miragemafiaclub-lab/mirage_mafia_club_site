// Club records, worked out from iMafia's monthly ratings (the seasons that have a month).
// The list is the club's own choice (2026-11-18): only these six.

import type { League, RatingRow, Season } from "./rating";

export type RecordId = "games" | "points" | "extra" | "extraPerGame" | "wins" | "mvp";

/** Who holds a record. `month`/`year` say when it was set; null for a record counted over all months. */
export type RecordHolder = { id: string; nick: string; month: number | null; year: number | null };

export type ClubRecord = { id: RecordId; value: number; holders: RecordHolder[] };

/** Order on the page. */
export const RECORD_IDS: RecordId[] = ["points", "wins", "games", "extra", "extraPerGame", "mvp"];

/** Two decimals, as iMafia shows points: so 2.1 and 2.0999999 count as a tie. */
const round = (n: number) => Math.round(n * 100) / 100;

/** The best value of `value` over every row of every month, with everyone who reached it. */
function bestInAMonth(
  id: RecordId,
  months: Season[],
  value: (row: RatingRow) => number,
  include: (row: RatingRow) => boolean = () => true,
): ClubRecord | null {
  let best: ClubRecord | null = null;
  for (const season of months) {
    for (const row of season.rows) {
      if (!include(row)) continue;
      const v = round(value(row));
      if (v <= 0) continue;
      const holder = { id: row.id, nick: row.nick, month: season.month, year: season.year };
      if (!best || v > best.value) best = { id, value: v, holders: [holder] };
      else if (v === best.value) best.holders.push(holder);
    }
  }
  return best;
}

/** Who was MVP of the month most often (iMafia's first MVP nominee of each monthly rating). */
function mostMvp(months: Season[]): ClubRecord | null {
  const counts = new Map<string, { nick: string; count: number }>();
  for (const season of months) {
    const id = season.mvp[0];
    const row = id && season.rows.find((r) => r.id === id);
    if (!row) continue;
    const entry = counts.get(id) ?? { nick: row.nick, count: 0 };
    entry.count += 1;
    counts.set(id, entry);
  }
  const top = Math.max(0, ...[...counts.values()].map((e) => e.count));
  if (!top) return null;
  return {
    id: "mvp",
    value: top,
    holders: [...counts]
      .filter(([, e]) => e.count === top)
      .map(([id, e]) => ({ id, nick: e.nick, month: null, year: null })),
  };
}

/** The earliest month the records cover (month 0 = January), or null with no monthly ratings. */
export function recordsSince(leagues: League[]): { month: number; year: number } | null {
  let first: { month: number; year: number } | null = null;
  for (const s of leagues.flatMap((l) => l.seasons)) {
    if (s.month === null || s.year === null) continue;
    if (!first || s.year * 12 + s.month < first.year * 12 + first.month) first = { month: s.month, year: s.year };
  }
  return first;
}

/** The six club records, in page order. Records nobody holds yet are left out. */
export function clubRecords(leagues: League[]): ClubRecord[] {
  const months = leagues.flatMap((l) => l.seasons).filter((s) => s.month !== null && s.year !== null);
  const records: Record<RecordId, ClubRecord | null> = {
    games: bestInAMonth("games", months, (r) => r.games),
    points: bestInAMonth("points", months, (r) => r.points),
    extra: bestInAMonth("extra", months, (r) => r.extraSum),
    // Only players above iMafia's "too few games" line: one lucky game is not a record.
    extraPerGame: bestInAMonth("extraPerGame", months, (r) => r.extraSum / r.games, (r) => r.counted && r.games > 0),
    wins: bestInAMonth("wins", months, (r) => r.wins),
    mvp: mostMvp(months),
  };
  return RECORD_IDS.flatMap((id) => (records[id] ? [records[id]] : []));
}
