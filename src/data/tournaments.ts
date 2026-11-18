import type { Lang } from "../i18n/lang";
import { playerByImafiaId, rosterPlayer, type ClubPlayer } from "./playerDirectory";
import data from "./tournaments.json";

// tournaments.json is written by `node scripts/sync-tournaments.mjs` (daily, see .github/workflows/sync-data.yml).

/** europe: offline in a European country; online; other: elsewhere or the country is unknown. */
export type TournamentKind = "europe" | "online" | "other";

export type TournamentPlayer = {
  /** Nick as in players.ts. */
  nick: string;
  imafiaId: string | null;
  /** confirmed by the organiser, or only applied so far. */
  status: "confirmed" | "applied";
};

export type Tournament = {
  id: string;
  source: "iMafia" | "MafGame";
  title: string;
  url: string;
  /** YYYY-MM-DD, the dates as the source gives them (local to the event; the sources have no times). */
  start: string;
  end: string;
  city: string;
  country: string | null;
  kind: TournamentKind;
  players: TournamentPlayer[];
};

const DATA = data as { updated: string | null; tournaments: Tournament[] };

export const TOURNAMENTS: Tournament[] = DATA.tournaments;
/** The day the list last changed (YYYY-MM-DD), or null before the first sync. */
export const TOURNAMENTS_UPDATED: string | null = DATA.updated;

/** The page's filters, in tab order. «Европа» is the default and has no ?f= in the address. */
export const FILTERS = ["europe", "online", "all"] as const;
export type TournamentFilter = (typeof FILTERS)[number];
export const DEFAULT_FILTER: TournamentFilter = "europe";

/** ?f=online → "online"; anything missing or unknown → the default. */
export function parseFilter(value: string | null): TournamentFilter {
  return (FILTERS as readonly string[]).includes(value ?? "") ? (value as TournamentFilter) : DEFAULT_FILTER;
}

export function filterTournaments(list: Tournament[], filter: TournamentFilter): Tournament[] {
  return filter === "all" ? list : list.filter((t) => t.kind === filter);
}

/** The player's page on the site, if they have one: by iMafia id first, then by roster nick. */
export function playerPage(player: TournamentPlayer): ClubPlayer | undefined {
  return (player.imafiaId ? playerByImafiaId(player.imafiaId) : undefined) ?? rosterPlayer(player.nick);
}

// Month names written out here rather than with Intl: the prerendered HTML (Node) and the browser must
// produce exactly the same text, and their Intl data can differ in spacing and abbreviations.
const MONTHS: Record<Lang, { long: string[]; short: string[] }> = {
  ru: {
    long: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    short: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  },
  en: {
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

const parts = (iso: string) => ({ year: iso.slice(0, 4), month: Number(iso.slice(5, 7)) - 1, day: Number(iso.slice(8, 10)) });

/** "21–22 ноября 2026", "30 ноября – 1 декабря 2026", "28 декабря 2026 – 2 января 2027"; one day: "5 декабря 2026". */
export function formatDateRange(start: string, end: string, lang: Lang): string {
  const a = parts(start);
  const b = parts(end);
  const month = (m: number) => MONTHS[lang].long[m];
  if (start === end) return `${a.day} ${month(a.month)} ${a.year}`;
  if (a.year !== b.year) return `${a.day} ${month(a.month)} ${a.year} – ${b.day} ${month(b.month)} ${b.year}`;
  if (a.month !== b.month) return `${a.day} ${month(a.month)} – ${b.day} ${month(b.month)} ${b.year}`;
  return `${a.day}–${b.day} ${month(a.month)} ${a.year}`;
}

/** Day and month for the date badge: { day: "21–22", month: "ноя" }, { day: "30–1", month: "ноя–дек" }. */
export function dateBadge(start: string, end: string, lang: Lang): { day: string; month: string } {
  const a = parts(start);
  const b = parts(end);
  const short = MONTHS[lang].short;
  return {
    day: start === end ? `${a.day}` : `${a.day}–${b.day}`,
    month: a.month === b.month ? short[a.month] : `${short[a.month]}–${short[b.month]}`,
  };
}

/** "18 ноября 2026" for the "updated" line. */
export function formatDay(iso: string, lang: Lang): string {
  return formatDateRange(iso, iso, lang);
}
