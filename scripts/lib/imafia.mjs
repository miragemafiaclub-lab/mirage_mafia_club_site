// Parsers for imafia.org pages. No network here: everything takes HTML/JSON text, so it is testable
// on saved pages (scripts/__fixtures__). iMafia has no public API; these follow its page markup.

export const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export function stripTags(html) {
  return html
    .replace(/<!--.*?-->/gs, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Leagues of the club and their seasons, from the rating filter on /club/<id>. Newest season first. */
export function parseLeagues(clubHtml) {
  const leagueSelect = clubHtml.match(/<select[^>]*id="leagues_id".*?<\/select>/s)?.[0] ?? "";
  const leagues = [...leagueSelect.matchAll(/<option value="(\d+)"[^>]*>([^<]*)/g)].map((m) => ({
    id: m[1],
    name: stripTags(m[2]),
  }));
  if (leagues.length === 0) throw new Error("iMafia: no leagues in the rating filter");

  const seasonSelect = clubHtml.match(/<select id="leagues_season_id">.*?<\/select>/s)?.[0] ?? "";
  const seasons = [...seasonSelect.matchAll(/<option value="(\d+)" data-leagues-id="(\d+)">([^<]*)/g)].map((m) => ({
    id: m[1],
    leagueId: m[2],
    name: stripTags(m[3]),
  }));

  return leagues.map((league) => {
    const own = seasons
      .filter((s) => s.leagueId === league.id)
      .sort((a, b) => Number(b.id) - Number(a.id))
      .map(({ id, name }) => ({ id, name, month: monthOf(name) }));
    // A league without seasons has one all-time table, asked for with an empty season id.
    return { ...league, seasons: own.length ? own : [{ id: "", name: "", month: null }] };
  });
}

/** 0–11 for "Рейтинг открытых вечеров. Октябрь", null for anything that is not a monthly season. */
export function monthOf(seasonName) {
  const index = MONTHS_RU.findIndex((m) => seasonName.trim().endsWith(m));
  return index === -1 ? null : index;
}

/**
 * Monthly season names carry no year: walk from the newest season back, stepping a year down whenever
 * the month stops decreasing. `seasons` must be newest first.
 */
export function assignYears(seasons, now) {
  let year = null;
  let prevMonth = null;
  return seasons.map((season) => {
    if (season.month === null) return { ...season, year: null };
    if (year === null) year = season.month > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
    else if (season.month >= prevMonth) year -= 1;
    prevMonth = season.month;
    return { ...season, year };
  });
}

const num = (text) => {
  const value = Number(String(text).replace(",", "."));
  return Number.isFinite(value) ? value : 0;
};

/**
 * The club rating table (the `items_html` of /aiax/main/club_rating), rows in iMafia's order.
 * Columns: # · player · Б · Б/И · extra Σ + − ! Лх · Ci · П · Д · Ш · В · games.
 * iMafia draws a line "30% (3)" above players with too few games to count; `cutoff` records it.
 */
export function parseRatingTable(itemsHtml) {
  const rows = [];
  let cutoff = null;
  for (const [, row] of itemsHtml.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)) {
    const line = row.match(/rating_groups_line"[^>]*>(.*?)<\/td>/s);
    if (line && !cutoff) {
      const [, percent, games] = stripTags(line[1]).match(/(\d+)%\s*\((\d+)\)/) ?? [];
      if (percent) cutoff = { percent: Number(percent), games: Number(games), after: rows.length };
      continue;
    }
    const cells = [...row.replace(/<!--.*?-->/gs, "").matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((m) => m[1]);
    const id = cells[1]?.match(/href="\/u\/(\d+)"/)?.[1];
    if (!id || cells.length < 15) continue;
    const [place, , points, avg, extraSum, extraPlus, extraMinus, discipline, bestMoves, ci, wins, donWins, sheriffWins, firstKilled, games] =
      cells.map(stripTags);
    rows.push({
      place: num(place),
      id,
      nick: stripTags(cells[1]),
      points: num(points),
      avg: num(avg),
      extraSum: num(extraSum),
      extraPlus: num(extraPlus),
      extraMinus: num(extraMinus),
      discipline: num(discipline),
      bestMoves: num(bestMoves),
      ci: num(ci),
      wins: num(wins),
      donWins: num(donWins),
      sheriffWins: num(sheriffWins),
      firstKilled: num(firstKilled),
      games: num(games),
    });
  }
  return { rows, cutoff };
}

/**
 * The season's MVP nominees, best first, from the `nominations` of the same response.
 * Order: judges' points, then fewer games (the same points in fewer games is the better result) —
 * this matches the order iMafia shows.
 */
export function parseMvp(nominations) {
  const mvp = nominations?.mvp;
  if (!mvp || typeof mvp !== "object") return [];
  return Object.values(mvp)
    .sort((a, b) => Number(b.points_judge) - Number(a.points_judge) || Number(a.games) - Number(b.games))
    .map((nominee) => String(nominee.id));
}

/** Club members listed on /club/<id>: iMafia id and nick. */
export function parseMembers(clubHtml) {
  const at = clubHtml.indexOf('id="club-members"');
  if (at === -1) return [];
  const block = clubHtml.slice(at);
  const members = new Map();
  for (const m of block.matchAll(/players__cards-item-content-name">\s*<a href="\/u\/(\d+)"><strong>(.*?)<\/strong>/gs)) {
    if (!members.has(m[1])) members.set(m[1], stripTags(m[2]));
  }
  return [...members].map(([id, nick]) => ({ id, nick }));
}

/** Avatar path and rank letter from a player's /u/<id> page. */
export function parseProfile(html) {
  const avatarAt = html.indexOf("content_user_page_avatar");
  const avatarBlock = avatarAt === -1 ? "" : html.slice(avatarAt, avatarAt + 800);
  return {
    photoPath: avatarBlock.match(/\/uploads\/users\/middle\/[^"']+/)?.[0] ?? null,
    rank: html.match(/<td>Rank<\/td>\s*<td>\s*([^<(]+)/)?.[1].trim() ?? "",
  };
}

const ROLE_NAMES = { don: "Дон", mafia: "Мафія", civilian: "Мирний", sheriff: "Шериф" };
const TOURNAMENT_TYPES = { Одиночний: "single", Командний: "team", Серія: "series", Серійний: "series" };

/** "14/11/2026" → "2026-11-14". */
const isoDate = (text) => {
  const [d, m, y] = text.split("/");
  return y && m && d ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` : "";
};

/**
 * Statistics from a player's /u/<id> page: win rate by role, first blood, awards and tournament results.
 * Numbers are for all the player's games on iMafia, not only the club's.
 */
export function parseProfileStats(html) {
  const { photoPath, rank } = parseProfile(html);
  const text = stripTags(html.replace(/<script.*?<\/script>|<style.*?<\/style>/gs, ""));

  const roles = {};
  for (const [key, name] of Object.entries(ROLE_NAMES)) {
    const m = text.match(new RegExp(`[\\d.]+% \\((\\d+)/(\\d+)\\) ${name}(?![\\p{L}])`, "u"));
    roles[key] = m ? { wins: Number(m[1]), games: Number(m[2]) } : { wins: 0, games: 0 };
  }

  const awards = [...html.matchAll(/content_user_page_award_year">\s*(\d{4})\s*<.*?content_user_page_award_name">(.*?)<\/div>/gs)].map(
    (m) => ({ year: Number(m[1]), name: stripTags(m[2]) }),
  );

  const tournaments = [];
  const tableAt = html.indexOf('id="user-tournaments"');
  const table = tableAt === -1 ? "" : html.slice(tableAt, html.indexOf("</table>", tableAt));
  for (const [, row] of table.matchAll(/<tr>(.*?)<\/tr>/gs)) {
    const cells = [...row.matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((m) => m[1]);
    const link = cells[1]?.match(/href="\/tournament\/(\d+)"[^>]*>(.*?)<\/a>/s);
    if (!link || cells.length < 6) continue;
    const type = cells[2].match(/data-tooltip="([^"]*)"/)?.[1] ?? "";
    tournaments.push({
      date: isoDate(stripTags(cells[0])),
      id: link[1],
      name: stripTags(link[2]),
      type: TOURNAMENT_TYPES[type] ?? "single",
      level: cells[3].match(/data-tooltip="([^"]*)"/)?.[1] ?? "",
      place: Number(stripTags(cells[4])) || null,
      players: Number(stripTags(cells[5])) || null,
    });
  }

  const pct = (re) => {
    const m = text.match(re);
    return m ? Number(m[1]) : null;
  };
  return {
    photoPath,
    rank,
    winRate: pct(/([\d.]+)% WinRate/),
    roles,
    firstBlood: pct(/First Blood ([\d.]+)%/),
    cups: pct(/Cups&Medals (\d+)/),
    awards,
    tournaments,
  };
}
