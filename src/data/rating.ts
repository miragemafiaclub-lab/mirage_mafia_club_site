/** One line of a rating table. Stored compactly in rating.json (see scripts/lib/rating.mjs ROW_FIELDS). */
export type RatingRow = {
  place: number;
  id: string;
  nick: string;
  points: number;
  avg: number;
  extraSum: number;
  extraPlus: number;
  extraMinus: number;
  discipline: number;
  bestMoves: number;
  ci: number;
  wins: number;
  donWins: number;
  sheriffWins: number;
  firstKilled: number;
  games: number;
  /** Place before the last change of this table; undefined for players new to it. */
  prevPlace?: number;
  /** False below iMafia's "too few games" line. */
  counted: boolean;
};

export type Season = {
  id: string;
  /** iMafia's name; monthly seasons are shown by month and year instead. */
  name: string;
  month: number | null;
  year: number | null;
  games: number;
  /** Minimum games to be counted, as iMafia draws it ("30% (3)"). */
  cutoff: { percent: number; games: number } | null;
  /** MVP nominees, best first. */
  mvp: string[];
  rows: RatingRow[];
  /** Whether any position changed at the last update (arrows are worth showing). */
  hasHistory: boolean;
};

export type League = { id: string; name: string; seasons: Season[] };

export type StoredSeason = {
  id: string;
  name: string;
  month: number | null;
  year: number | null;
  games: number;
  cutoff: { percent: number; games: number; after: number } | null;
  mvp: string[];
  nicks: Record<string, string>;
  rows: (string | number)[][];
  prev: Record<string, number>;
};

/** rating.json as written by scripts/sync-rating.mjs. Loaded only by the pages that need it (see pageData.tsx). */
export type StoredRating = {
  updatedAt: string;
  leagues: { id: string; name: string; seasons: StoredSeason[] }[];
  members: { id: string; nick: string }[];
};

export function unpackSeason(season: StoredSeason): Season {
  const rows = season.rows.map((r, index): RatingRow => {
    const id = String(r[1]);
    return {
      place: Number(r[0]),
      id,
      nick: season.nicks[id] ?? id,
      points: Number(r[2]),
      avg: Number(r[3]),
      extraSum: Number(r[4]),
      extraPlus: Number(r[5]),
      extraMinus: Number(r[6]),
      discipline: Number(r[7]),
      bestMoves: Number(r[8]),
      ci: Number(r[9]),
      wins: Number(r[10]),
      donWins: Number(r[11]),
      sheriffWins: Number(r[12]),
      firstKilled: Number(r[13]),
      games: Number(r[14]),
      prevPlace: season.prev[id],
      counted: !season.cutoff || index < season.cutoff.after,
    };
  });
  return {
    id: season.id,
    name: season.name,
    month: season.month,
    year: season.year,
    games: season.games,
    cutoff: season.cutoff && { percent: season.cutoff.percent, games: season.cutoff.games },
    mvp: season.mvp,
    rows,
    hasHistory: Object.keys(season.prev).length > 0,
  };
}

/** All leagues of the club with their seasons, newest season first. */
export function unpackRating(stored: StoredRating): League[] {
  return stored.leagues.map((league) => ({
    id: league.id,
    name: league.name,
    seasons: league.seasons.map(unpackSeason),
  }));
}

export const IMAFIA_CLUB_URL = "https://imafia.org/club/35";
export const imafiaProfileUrl = (id: string) => `https://imafia.org/u/${id}`;
