import { playerByImafiaId } from "./playerDirectory";
import type { PlayerStats } from "./playerStats";
import type { League, Season } from "./rating";
import { DEFAULT_LEAGUE_NAME, pickSelection } from "./ratingView";

export type CompareRowId =
  | "annual" | "month" | "games" | "wins" | "winRate" | "mvp" | "prizes" | "cups"
  | "don" | "mafia" | "civilian" | "sheriff";

/** How to read one row: its value for a player, how to print it, and which way is better. */
type RowSpec = { id: CompareRowId; value: (s: PlayerStats) => number | null; lowerIsBetter?: boolean; percent?: boolean };

const rolePct = (role: "don" | "mafia" | "civilian" | "sheriff") => (s: PlayerStats) => {
  const r = s.profile?.roles[role];
  return r && r.games > 0 ? Math.round((r.wins / r.games) * 1000) / 10 : null;
};

export const COMPARE_ROWS: RowSpec[] = [
  { id: "annual", value: (s) => s.places.find((p) => DEFAULT_LEAGUE_NAME.test(p.leagueName))?.place ?? null, lowerIsBetter: true },
  { id: "month", value: (s) => s.places.find((p) => p.month !== null)?.place ?? null, lowerIsBetter: true },
  { id: "games", value: (s) => s.places.find((p) => DEFAULT_LEAGUE_NAME.test(p.leagueName))?.games ?? null },
  { id: "wins", value: (s) => s.places.find((p) => DEFAULT_LEAGUE_NAME.test(p.leagueName))?.wins ?? null },
  { id: "winRate", value: (s) => s.profile?.winRate ?? null, percent: true },
  { id: "mvp", value: (s) => s.mvpMonths },
  { id: "prizes", value: (s) => (s.profile ? s.profile.prizes.length : null) },
  { id: "cups", value: (s) => s.profile?.cups ?? null },
  { id: "don", value: rolePct("don"), percent: true },
  { id: "mafia", value: rolePct("mafia"), percent: true },
  { id: "civilian", value: rolePct("civilian"), percent: true },
  { id: "sheriff", value: rolePct("sheriff"), percent: true },
];

/** Which side wins a row: "a", "b", or null for a tie or a missing value. */
export function betterSide(row: RowSpec, a: PlayerStats, b: PlayerStats): "a" | "b" | null {
  const va = row.value(a);
  const vb = row.value(b);
  if (va === null || vb === null || va === vb) return null;
  return (row.lowerIsBetter ? va < vb : va > vb) ? "a" : "b";
}

/** A ready-made pair for the empty compare page; `a` and `b` are player slugs (the page's ?a=…&b=…). */
export type ComparePair = { kind: "annual" | "month" | "leaders" | "winners"; a: string; b: string };

type MonthWinner = { profileUrl: string };

const idFromProfile = (url: string) => url.match(/\/u\/(\d+)/)?.[1];

/**
 * Up to four interesting pairs, from the rating and the monthly winners: the year's top two, last month's
 * top two, the leaders of the year and of the month, and the last two players of the month. Players without
 * a page are skipped, and so is a pair already suggested (in either order).
 */
export function suggestedPairs(leagues: League[], winners: Record<string, MonthWinner | undefined>): ComparePair[] {
  const slug = (id: string | undefined) => (id ? playerByImafiaId(id)?.slug : undefined);
  const top = (season: Season | undefined) =>
    (season?.rows ?? []).filter((row) => row.counted).sort((x, y) => x.place - y.place).map((row) => row.id);

  const annual = top(pickSelection(leagues, {}).season);
  const month = top(leagues.find((l) => l.name === "Month Rating")?.seasons[0]);
  const lastWinners = [
    ...new Set(
      Object.keys(winners)
        .sort()
        .reverse()
        .map((key) => winners[key] && idFromProfile(winners[key].profileUrl))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const candidates: [ComparePair["kind"], string | undefined, string | undefined][] = [
    ["annual", annual[0], annual[1]],
    ["month", month[0], month[1]],
    ["leaders", annual[0], month[0]],
    ["winners", lastWinners[0], lastWinners[1]],
  ];
  const pairs: ComparePair[] = [];
  const seen = new Set<string>();
  for (const [kind, idA, idB] of candidates) {
    const a = slug(idA);
    const b = slug(idB);
    const key = [a, b].sort().join("|");
    if (!a || !b || a === b || seen.has(key)) continue;
    seen.add(key);
    pairs.push({ kind, a, b });
  }
  return pairs;
}
