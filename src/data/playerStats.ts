import { unpackSeason, type StoredRating } from "./rating";

type RoleStat = { wins: number; games: number };

/** One iMafia profile as kept by scripts/sync-profiles.mjs (all the player's games on iMafia, not only the club's). */
export type ProfileRecord = {
  fetchedAt: string;
  rank: string;
  winRate: number | null;
  roles: { don: RoleStat; mafia: RoleStat; civilian: RoleStat; sheriff: RoleStat };
  firstBlood: number | null;
  cups: number | null;
  awards: { year: number; name: string }[];
  tournaments: number;
  prizes: { date: string; id: string; name: string; type: string; level: string; place: number; players: number | null }[];
  avatar: string | null;
};

/** The player's line in one rating table. */
export type PlayerPlace = {
  leagueId: string;
  leagueName: string;
  seasonId: string;
  seasonName: string;
  month: number | null;
  year: number | null;
  place: number;
  /** Players in that table. */
  of: number;
  counted: boolean;
  points: number;
  avg: number;
  games: number;
  wins: number;
  extraSum: number;
};

/** Everything a profile page shows about a player, computed at build time and shipped with that page only. */
export type PlayerStats = {
  id: string;
  /** Every table the player appears in, leagues in iMafia's order, newest season first. */
  places: PlayerPlace[];
  /** Month Rating, oldest month first: points and place each month the player played. */
  monthly: { year: number; month: number; points: number; place: number; games: number; counted: boolean }[];
  /** Months in which the player was the season's MVP (iMafia's first nominee). */
  mvpMonths: number;
  profile: ProfileRecord | null;
  updatedAt: string;
};

export const MONTH_LEAGUE = "Month Rating";

export function buildPlayerStats(rating: StoredRating, profiles: Record<string, ProfileRecord>, id: string): PlayerStats {
  const places: PlayerPlace[] = [];
  const monthly: PlayerStats["monthly"] = [];
  let mvpMonths = 0;

  for (const league of rating.leagues) {
    for (const stored of league.seasons) {
      const season = unpackSeason(stored);
      const row = season.rows.find((r) => r.id === id);
      if (league.name === MONTH_LEAGUE && season.mvp[0] === id) mvpMonths += 1;
      if (!row) continue;
      places.push({
        leagueId: league.id,
        leagueName: league.name,
        seasonId: season.id,
        seasonName: season.name,
        month: season.month,
        year: season.year,
        place: row.place,
        of: season.rows.length,
        counted: row.counted,
        points: row.points,
        avg: row.avg,
        games: row.games,
        wins: row.wins,
        extraSum: row.extraSum,
      });
      if (league.name === MONTH_LEAGUE && season.month !== null && season.year !== null) {
        monthly.push({ year: season.year, month: season.month, points: row.points, place: row.place, games: row.games, counted: row.counted });
      }
    }
  }

  monthly.sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
  return { id, places, monthly, mvpMonths, profile: profiles[id] ?? null, updatedAt: rating.updatedAt };
}
