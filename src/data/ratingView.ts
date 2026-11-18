import { nickKey } from "./playerDirectory";
import type { League, RatingRow, Season } from "./rating";
import { rating as dict } from "../i18n/rating";
import type { Lang } from "../i18n/lang";

/** The league shown first: the annual rating, the one most players care about. */
export const DEFAULT_LEAGUE_NAME = /^Годовой рейтинг/;

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

/** Which league and season to show: from the address (?league=…&season=…) if valid, otherwise the defaults. */
export function pickSelection(
  leagues: League[],
  params: { league?: string | null; season?: string | null },
): { league: League; season: Season } {
  const fallback = leagues.find((l) => DEFAULT_LEAGUE_NAME.test(l.name)) ?? leagues[0];
  const league = leagues.find((l) => l.id === params.league) ?? fallback;
  const season = league.seasons.find((s) => s.id === (params.season ?? "")) ?? league.seasons[0];
  return { league, season };
}

/** Rows whose nick contains the query, compared loosely (case, spaces, punctuation and emoji ignored). */
export function filterRows(rows: RatingRow[], query: string): RatingRow[] {
  const key = nickKey(query);
  return key ? rows.filter((row) => nickKey(row.nick).includes(key)) : rows;
}

/** Rows a long table shows before "Show all": a phone screen or two, not 130 rows in one scroll. */
export const COLLAPSED_ROWS = 20;
/** A table only this much longer than the collapsed view is shown whole: a button for five rows is not worth it. */
const COLLAPSE_SLACK = 5;

/**
 * The rows a table shows: all of them while searching (every match), once opened, or when the table is short;
 * otherwise the first COLLAPSED_ROWS, with how many more there are behind the "Show all" button.
 */
export function visibleRows(
  rows: RatingRow[],
  { searching, expanded }: { searching: boolean; expanded: boolean },
): { rows: RatingRow[]; hidden: number } {
  if (searching || expanded || rows.length <= COLLAPSED_ROWS + COLLAPSE_SLACK) return { rows, hidden: 0 };
  return { rows: rows.slice(0, COLLAPSED_ROWS), hidden: rows.length - COLLAPSED_ROWS };
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
