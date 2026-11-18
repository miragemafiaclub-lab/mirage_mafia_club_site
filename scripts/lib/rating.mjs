// Pure helpers for scripts/sync-rating.mjs (tested in rating.test.mjs).

/** Compact row for rating.json: [place, id, points, avg, extraSum, extraPlus, extraMinus, discipline, bestMoves, ci, wins, donWins, sheriffWins, firstKilled, games]. */
export const ROW_FIELDS = [
  "place", "id", "points", "avg", "extraSum", "extraPlus", "extraMinus", "discipline",
  "bestMoves", "ci", "wins", "donWins", "sheriffWins", "firstKilled", "games",
];

const pack = (row) => ROW_FIELDS.map((field) => row[field]);

/**
 * The season as stored, with `prev`: each player's place before the last change of this table,
 * so the site can show arrows. An unchanged table keeps the old `prev`; a changed one takes the old places.
 */
export function mergeSeason(fresh, old) {
  const rows = fresh.rows.map(pack);
  const nicks = Object.fromEntries(fresh.rows.map((row) => [row.id, row.nick]));
  const same = old && JSON.stringify(old.rows) === JSON.stringify(rows);
  const prev = same ? (old.prev ?? {}) : old ? Object.fromEntries(old.rows.map((row) => [row[1], row[0]])) : {};
  return {
    id: fresh.id,
    name: fresh.name,
    month: fresh.month,
    year: fresh.year,
    games: fresh.games,
    cutoff: fresh.cutoff ?? null,
    mvp: fresh.mvp,
    nicks,
    rows,
    prev,
  };
}

/** "2026-10" for a monthly season. */
export const monthKey = (season) => `${season.year}-${String(season.month + 1).padStart(2, "0")}`;

/** Finished months whose winner is not recorded yet: the player in first place right now. */
export function newWinners(monthSeasons, recorded, now) {
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  return monthSeasons
    .filter((season) => season.month !== null && season.year * 12 + season.month < currentMonth)
    .filter((season) => !recorded[monthKey(season)])
    .flatMap((season) => {
      const first = season.rows.find((row) => row[0] === 1);
      return first ? [{ key: monthKey(season), id: first[1], nick: season.nicks[first[1]] }] : [];
    });
}
