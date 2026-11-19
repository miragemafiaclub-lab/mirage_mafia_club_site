import { nickKey } from "./playerDirectory";
import { MONTH_LEAGUE } from "./playerStats";
import type { League, RatingRow, Season } from "./rating";
import { rating as dict } from "../i18n/rating";
import type { Lang } from "../i18n/lang";

/** The annual rating: the club's year-long table (a profile's "annual place"). */
export const DEFAULT_LEAGUE_NAME = /^Годовой рейтинг/;

/**
 * The rating page's tabs: the month first (opened by default: the table that changes every evening), then the
 * annual rating, then the rest in iMafia's order.
 */
export function orderLeagues(leagues: League[]): League[] {
  const rank = (l: League) => (l.name === MONTH_LEAGUE ? 0 : DEFAULT_LEAGUE_NAME.test(l.name) ? 1 : 2);
  return leagues.map((l, i) => ({ l, i })).sort((a, b) => rank(a.l) - rank(b.l) || a.i - b.i).map(({ l }) => l);
}

/** The club's annual table, if it has one. */
export function annualLeague(leagues: League[]): League | undefined {
  return leagues.find((l) => DEFAULT_LEAGUE_NAME.test(l.name));
}

export function leagueLabel(league: League, lang: Lang): string {
  const t = dict[lang];
  const year = league.name.match(/^Годовой рейтинг IMafia (\d{4})$/)?.[1];
  if (year) return t.annual(year);
  return t.leagueNames[league.name] ?? league.name;
}

/** "Март 2026" (month 0 = January). */
export function monthLabel(month: number, year: number, lang: Lang): string {
  return `${dict[lang].months[month]} ${year}`;
}

export function seasonLabel(season: Season, lang: Lang): string {
  const t = dict[lang];
  if (season.month !== null && season.year !== null) return monthLabel(season.month, season.year, lang);
  if (!season.name) return t.allTime;
  const year = season.name.match(/^Годовой рейтинг IMafia (\d{4})$/)?.[1];
  return year ? t.annual(year) : t.season(season.name);
}

/** Which league and season to show: from the address (?league=…&season=…) if valid, otherwise the current month. */
export function pickSelection(
  leagues: League[],
  params: { league?: string | null; season?: string | null },
): { league: League; season: Season } {
  // The newest month (seasons are newest first), then the annual rating if the club has no monthly table.
  const fallback = leagues.find((l) => l.name === MONTH_LEAGUE) ?? annualLeague(leagues) ?? leagues[0];
  const league = leagues.find((l) => l.id === params.league) ?? fallback;
  const season = league.seasons.find((s) => s.id === (params.season ?? "")) ?? league.seasons[0];
  return { league, season };
}

/**
 * "Find yourself": the rows whose nick matches the query, best first (the whole nick, then its start, then
 * anywhere in it), compared loosely (case, spaces, punctuation and emoji ignored). The table is not filtered:
 * the page jumps to the first match, wherever it is.
 */
export function findRows(rows: RatingRow[], query: string): RatingRow[] {
  const key = nickKey(query);
  if (!key) return [];
  const rank = (row: RatingRow) => {
    const nick = nickKey(row.nick);
    if (nick === key) return 0;
    if (nick.startsWith(key)) return 1;
    return nick.includes(key) ? 2 : -1;
  };
  return rows
    .map((row) => ({ row, rank: rank(row) }))
    .filter((m) => m.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.row.place - b.row.place)
    .map((m) => m.row);
}

/** Rows a long table shows before "Show all": the top of the table, not 130 rows in one scroll. */
export const COLLAPSED_ROWS = 15;
/** A table only this much longer than the collapsed view is shown whole: a button for one or two rows is not worth it. */
const COLLAPSE_SLACK = 2;

/**
 * The rows a table shows: all of them once opened (by "Show all", or by finding a player further down), or when
 * the table is short; otherwise the first COLLAPSED_ROWS, with how many more there are behind the button.
 */
export function visibleRows(rows: RatingRow[], { expanded }: { expanded: boolean }): { rows: RatingRow[]; hidden: number } {
  if (expanded || rows.length <= COLLAPSED_ROWS + COLLAPSE_SLACK) return { rows, hidden: 0 };
  return { rows: rows.slice(0, COLLAPSED_ROWS), hidden: rows.length - COLLAPSED_ROWS };
}

/** Whether a row is behind "Show all" while its table is collapsed. */
export function isHiddenRow(rows: RatingRow[], row: RatingRow): boolean {
  return !visibleRows(rows, { expanded: false }).rows.includes(row);
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Points without the extras: what the games themselves brought (all points minus the extra points). */
export const basePoints = (row: RatingRow) => round2(row.points - row.extraSum);

/** Extra points per game played (0 for a row without games). */
export const extraPerGame = (row: RatingRow) => (row.games > 0 ? row.extraSum / row.games : 0);

/**
 * Wins neither as the Don nor as the Sheriff. iMafia has four roles (civilian, mafia, Don, Sheriff), so these are
 * the wins as a civilian or as a mafioso together; the table does not say how they split.
 */
export const otherRoleWins = (row: RatingRow) => Math.max(0, row.wins - row.donWins - row.sheriffWins);

/** Share of games won, 0–100 (0 without games). */
export const winRate = (row: { wins: number; games: number }) => (row.games > 0 ? (row.wins / row.games) * 100 : 0);

/**
 * What a table's places follow, checked on its counted rows: iMafia sorts most tables by the average per game,
 * a few by total points, and some older ones by neither (null: then no "gap to the next place" is shown).
 */
export type RankMetric = "avg" | "points";

export function rankMetric(season: Season): RankMetric | null {
  const counted = season.rows.filter((row) => row.counted);
  if (counted.length === 0) return null;
  const sortedBy = (value: (row: RatingRow) => number) =>
    counted.every((row, i) => i === 0 || value(row) <= value(counted[i - 1]));
  if (sortedBy((row) => row.avg)) return "avg";
  if (sortedBy((row) => row.points)) return "points";
  return null;
}

export const metricValue = (row: RatingRow, metric: RankMetric) => (metric === "avg" ? row.avg : row.points);

export type Standing =
  /** First place: `lead` (of the table's metric) ahead of the second, if there is one. */
  | { kind: "leader"; metric: RankMetric; lead: number; next: RatingRow | null }
  /** Counted: `gap` (of the metric) behind the player one place higher. */
  | { kind: "gap"; metric: RankMetric; gap: number; target: RatingRow }
  /** Below the cutoff: `games` more games reach today's threshold of `threshold` games. */
  | { kind: "uncounted"; games: number; threshold: number };

/** Where a row stands against its neighbours; null where the table's order does not allow an honest number. */
export function standing(row: RatingRow, season: Season): Standing | null {
  if (!row.counted) {
    if (!season.cutoff) return null;
    return { kind: "uncounted", games: Math.max(1, season.cutoff.games - row.games), threshold: season.cutoff.games };
  }
  const metric = rankMetric(season);
  if (!metric) return null;
  const counted = season.rows.filter((r) => r.counted);
  const index = counted.indexOf(row);
  if (index === -1) return null;
  if (index === 0) {
    const next = counted[1] ?? null;
    return { kind: "leader", metric, lead: next ? round2(metricValue(row, metric) - metricValue(next, metric)) : 0, next };
  }
  const target = counted[index - 1];
  return { kind: "gap", metric, gap: round2(metricValue(target, metric) - metricValue(row, metric)), target };
}

/** The first three counted rows of a table, for the podium (fewer when fewer players are counted). */
export function podiumRows(season: Season): RatingRow[] {
  return season.rows.filter((row) => row.counted).slice(0, 3);
}

export type PlaceChange = { kind: "up" | "down"; by: number } | { kind: "same" } | { kind: "new" } | null;

/** How a row moved since the table's previous update; null when the table has no history yet. */
export function placeChange(row: RatingRow, season: Season): PlaceChange {
  if (!season.hasHistory) return null;
  if (row.prevPlace === undefined) return { kind: "new" };
  const by = row.prevPlace - row.place;
  if (by > 0) return { kind: "up", by };
  if (by < 0) return { kind: "down", by: -by };
  return { kind: "same" };
}

/** "18.11.2026" in Warsaw time, the same on the server and in any browser. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Warsaw", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

/** Numbers as iMafia writes them, without trailing zeros: 2.5, 11, -0.3. */
export const formatNumber = (value: number) => String(Math.round(value * 100) / 100);

/** The home page's "best players of the month": the Month Rating's latest month that has counted players. */
export type MonthTop = {
  leagueId: string;
  seasonId: string;
  month: number;
  year: number;
  /** Games needed to be counted that month, if iMafia drew the line. */
  cutoffGames: number | null;
  metric: RankMetric | null;
  rows: Pick<RatingRow, "place" | "id" | "nick" | "games" | "wins" | "avg" | "points">[];
};

export function monthTop(leagues: League[], size = 5): MonthTop | null {
  const league = leagues.find((l) => l.name === MONTH_LEAGUE);
  if (!league) return null;
  for (const season of league.seasons) {
    if (season.month === null || season.year === null) continue;
    const counted = season.rows.filter((row) => row.counted);
    if (counted.length === 0) continue;
    return {
      leagueId: league.id,
      seasonId: season.id,
      month: season.month,
      year: season.year,
      cutoffGames: season.cutoff?.games ?? null,
      metric: rankMetric(season),
      rows: counted
        .slice(0, size)
        .map(({ place, id, nick, games, wins, avg, points }) => ({ place, id, nick, games, wins, avg, points })),
    };
  }
  return null;
}

/** Signed, with a real minus sign: "+2", "−0.3", "0"; `digits` fixes the decimals ("+0.33", "0.00"). */
export function formatSigned(value: number, digits?: number): string {
  const rounded = digits === undefined ? Math.round(value * 100) / 100 : Number(value.toFixed(digits));
  const text = digits === undefined ? String(Math.abs(rounded)) : Math.abs(rounded).toFixed(digits);
  if (rounded === 0) return text;
  return `${rounded > 0 ? "+" : "−"}${text}`;
}
