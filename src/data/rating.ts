import data from "./rating.json";

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

type StoredSeason = {
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

type Stored = {
  updatedAt: string;
  leagues: { id: string; name: string; seasons: StoredSeason[] }[];
  members: { id: string; nick: string }[];
};

const stored = data as Stored;

function unpack(season: StoredSeason): Season {
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
export const LEAGUES: League[] = stored.leagues.map((league) => ({
  id: league.id,
  name: league.name,
  seasons: league.seasons.map(unpack),
}));

/** When the rating data last changed (ISO date). */
export const RATING_UPDATED_AT: string = stored.updatedAt;

/** Club members as listed on iMafia. */
export const IMAFIA_MEMBERS = stored.members;

export const IMAFIA_CLUB_URL = "https://imafia.org/club/35";
export const imafiaProfileUrl = (id: string) => `https://imafia.org/u/${id}`;

/** Every player who appears in any rating, with their most recent nick (newest season wins). */
export function ratingPlayers(): { id: string; nick: string }[] {
  const nicks = new Map<string, string>();
  for (const league of stored.leagues) {
    for (const season of league.seasons) {
      for (const [id, nick] of Object.entries(season.nicks)) if (!nicks.has(id)) nicks.set(id, nick);
    }
  }
  return [...nicks].map(([id, nick]) => ({ id, nick }));
}
