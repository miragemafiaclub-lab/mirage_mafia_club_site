// Which iMafia profiles to refresh today (tested in profiles.test.mjs). A profile page is ~1.4 MB,
// so only a few are fetched per day: see docs/decisions/0005-profile-sync.md.

export const DAILY_LIMIT = 25;
export const MAX_AGE_DAYS = 14;
const DAY_MS = 86_400_000;

/** iMafia's placeholder accounts for one-off visitors ("Гость", "Гость1"). */
export const isPlaceholderGuest = (nick) => /^(гость|guest)\s*\d*$/i.test(nick.trim());

/** Everyone in the stored rating: id, latest nick, games across all tables, and whether they are a club member. */
export function candidatesFrom(rating) {
  const members = new Set((rating.members ?? []).map((m) => m.id));
  const players = new Map();
  for (const league of rating.leagues) {
    for (const season of league.seasons) {
      for (const row of season.rows) {
        const id = String(row[1]);
        const nick = season.nicks[id] ?? id;
        const player = players.get(id) ?? { id, nick, games: 0, member: members.has(id) };
        player.games += Number(row[14]) || 0;
        players.set(id, player);
      }
    }
  }
  return [...players.values()].filter((p) => !isPlaceholderGuest(p.nick));
}

/**
 * Up to `limit` ids, most needed first: never fetched (club members first, then by games played),
 * then players who played since their last fetch, then profiles older than MAX_AGE_DAYS (oldest first).
 */
export function pickProfiles(candidates, stored, now, limit = DAILY_LIMIT) {
  const missing = candidates
    .filter((c) => !stored[c.id])
    .sort((a, b) => Number(b.member) - Number(a.member) || b.games - a.games);
  const played = candidates.filter((c) => stored[c.id] && stored[c.id].gamesSeen !== c.games);
  const stale = candidates
    .filter((c) => stored[c.id] && stored[c.id].gamesSeen === c.games)
    .filter((c) => now - Date.parse(stored[c.id].fetchedAt) > MAX_AGE_DAYS * DAY_MS)
    .sort((a, b) => Date.parse(stored[a.id].fetchedAt) - Date.parse(stored[b.id].fetchedAt));
  return [...missing, ...played, ...stale].slice(0, limit).map((c) => c.id);
}

/** What the site keeps from a parsed profile: stats, and only the prize places from the tournament list. */
export function profileRecord(stats, { games, now, avatar }) {
  return {
    fetchedAt: new Date(now).toISOString(),
    gamesSeen: games,
    rank: stats.rank,
    winRate: stats.winRate,
    roles: stats.roles,
    firstBlood: stats.firstBlood,
    cups: stats.cups,
    awards: stats.awards,
    tournaments: stats.tournaments.length,
    prizes: stats.tournaments.filter((t) => t.place !== null && t.place <= 3),
    avatar,
  };
}
