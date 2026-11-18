import type { PlayerStats } from "./playerStats";
import { DEFAULT_LEAGUE_NAME } from "./ratingView";

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
