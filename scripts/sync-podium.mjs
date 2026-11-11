// Refreshes src/data/podium.json: how the club's ЧК and КЧК placed at tournaments that ended
// in the last finished two-week period, taken from imafia.org and mafgame.org.
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const IMAFIA = "https://imafia.org";
const MAFGAME = "https://mafgame.org";
const IMAFIA_CLUB_ID = "35";
const MAFGAME_CLUB_ID = 62;

const dataFile = fileURLToPath(new URL("../src/data/podium.json", import.meta.url));
const playersFile = fileURLToPath(new URL("../src/data/players.ts", import.meta.url));

const pause = () => new Promise((resolve) => setTimeout(resolve, 700));

async function fetchText(url) {
  await pause();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
}

// Lowercased letters and digits only, so "Сью⚡️" matches "Сью" and "Мёд" matches "Мед".
function normalizeNick(nick) {
  return nick.normalize("NFKC").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
}

// A real finishing place: unplaced players come back as 0, null, NaN or MafGame's 65535.
function isPlace(place) {
  return Number.isInteger(place) && place > 0 && place < 65535;
}

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Periods are two weeks long, Monday to Sunday, counted from this Monday:
// 26.10 – 08.11, 09.11 – 22.11 and so on.
const FIRST_PERIOD_START = new Date(2026, 9, 26);
const PERIOD_DAYS = 14;
const DAY_MS = 86_400_000;

// The latest period that is already over, so the podium changes every second Monday.
function lastPeriod(now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Rounding absorbs the hour a clock change adds or removes.
  const daysIn = Math.round((today - FIRST_PERIOD_START) / DAY_MS);
  const finished = Math.floor(daysIn / PERIOD_DAYS) - 1;
  const start = new Date(FIRST_PERIOD_START);
  start.setDate(start.getDate() + finished * PERIOD_DAYS);
  const end = new Date(start);
  end.setDate(start.getDate() + PERIOD_DAYS - 1);
  return { start: isoDate(start), end: isoDate(end) };
}

function addDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  return isoDate(new Date(year, month - 1, day + days));
}

async function readRoster() {
  const source = await readFile(playersFile, "utf8");
  const split = source.indexOf("export const KCHK_BASE");
  const parse = (part, group) =>
    [...part.matchAll(/^ {4}nick: "([^"]+)",\n {4}name: "([^"]*)"/gm)].map((match) => ({
      nick: match[1],
      name: match[2],
      group,
    }));
  const roster = [...parse(source.slice(0, split), "ЧК"), ...parse(source.slice(split), "КЧК")];
  if (split === -1 || roster.length === 0) throw new Error(`No players read from ${playersFile}`);

  const clubHtml = await fetchText(`${IMAFIA}/club/${IMAFIA_CLUB_ID}`);
  const imafiaIds = new Map();
  for (const match of clubHtml.matchAll(/href="\/u\/(\d+)"[^>]*>(.*?)<\/a>/gs)) {
    const label = stripTags(match[2]);
    if (label.includes("●")) imafiaIds.set(label.split("●")[0].trim(), match[1]);
  }
  if (imafiaIds.size === 0) throw new Error(`iMafia: no club members found on /club/${IMAFIA_CLUB_ID}`);
  for (const player of roster) player.imafiaId = imafiaIds.get(player.nick) ?? null;
  return roster;
}

// ---------- iMafia ----------

const IMAFIA_FORMATS = { Одиночний: "single", Командний: "team", Серія: "series", Серійний: "series" };

function readImafiaTable(html, id) {
  const start = html.indexOf(`id="${id}"`);
  if (start === -1) return [];
  const body = html.slice(start, html.indexOf("</table>", start));
  return [...body.matchAll(/<tr>(.*?)<\/tr>/gs)]
    .map((row) => [...row[1].matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((cell) => cell[1]))
    .filter((cells) => cells.length >= 2)
    .map((cells) => ({
      place: Number(stripTags(cells[0])),
      ids: [...cells[1].matchAll(/href="\/u\/(\d+)"/g)].map((link) => link[1]),
      team: cells[1].match(/<div>(.*?)<\/div>/s)?.[1],
    }));
}

// Single tournaments list the final and the qualification separately; the "Бали" tab has the
// overall order, so it is preferred, and the final followed by the qualification is the fallback.
function imafiaPersonalPlaces(html, format) {
  const points = readImafiaTable(html, "tournament-points");
  if (points.length > 0) return new Map(points.map((row, index) => [row.ids[0], index + 1]));

  const qualification = readImafiaTable(html, "table_results");
  if (format !== "single") return new Map(qualification.map((row) => [row.ids[0], row.place]));

  const places = new Map(readImafiaTable(html, "table_results_final").map((row) => [row.ids[0], row.place]));
  let next = places.size;
  for (const row of qualification) if (!places.has(row.ids[0])) places.set(row.ids[0], ++next);
  return places;
}

async function readImafia(period, roster) {
  const ours = new Map(roster.filter((player) => player.imafiaId).map((player) => [player.imafiaId, player]));
  const listed = [];
  const maxPages = 20;
  for (let page = 1; page <= maxPages; page++) {
    const html = await fetchText(`${IMAFIA}/tournaments?f[date]=old&page=${page}`);
    const items = [...html.matchAll(/href="\/tournament\/(\d+)" class="tournaments_item_link">(.*?)<\/a>/gs)].map(
      (match) => {
        const date = stripTags(match[2]).match(/^(\d\d)\.(\d\d)\.(\d{4}|\d\d)(?!\d)/);
        if (!date) throw new Error(`iMafia: no date for tournament ${match[1]}`);
        const [, day, month, year] = date;
        return { id: match[1], start: `${year.length === 2 ? `20${year}` : year}-${month}-${day}` };
      },
    );
    listed.push(...items);
    // Multi-day events are listed by their first day, so look a week past the start.
    if (items.length === 0 || items[items.length - 1].start < addDays(period.start, -7)) break;
    if (page === maxPages) console.warn(`iMafia: stopped at page ${maxPages} before reaching ${period.start}`);
  }

  const tournaments = [];
  for (const { id, start } of listed) {
    if (start > period.end || start < addDays(period.start, -7)) continue;
    const html = await fetchText(`${IMAFIA}/tournament/${id}`);
    const info = stripTags(html.slice(html.indexOf('id="tournament-info"'), html.indexOf('id="tournament-results"')));
    const dates = info.match(/Дата (\d\d)\.(\d\d)\.(\d{4})(?: - (\d\d)\.(\d\d)\.(\d{4}))?/);
    if (!dates) continue;
    const end = dates[4] ? `${dates[6]}-${dates[5]}-${dates[4]}` : `${dates[3]}-${dates[2]}-${dates[1]}`;
    if (end < period.start || end > period.end) continue;

    const format = IMAFIA_FORMATS[info.match(/Тип турніра (\S+)/)?.[1]] ?? "single";
    const personal = imafiaPersonalPlaces(html, format);
    const teams = new Map();
    if (format === "team") {
      for (const row of readImafiaTable(html, "table_results_final")) {
        for (const playerId of row.ids) teams.set(playerId, { name: stripTags(row.team ?? ""), place: row.place });
      }
    }
    const results = [...personal.keys()]
      .filter((playerId) => ours.has(playerId) && isPlace(personal.get(playerId)))
      .map((playerId) => ({
        nick: ours.get(playerId).nick,
        group: ours.get(playerId).group,
        place: personal.get(playerId),
        team: isPlace(teams.get(playerId)?.place) ? teams.get(playerId) : null,
        profileUrl: `${IMAFIA}/u/${playerId}`,
      }));
    if (results.length === 0) continue;

    tournaments.push({
      source: "iMafia",
      title: stripTags(html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1] ?? "").replace(/ share$/, ""),
      url: `${IMAFIA}/tournament/${id}`,
      start: `${dates[3]}-${dates[2]}-${dates[1]}`,
      end,
      location: info.match(/Локація (.*?) Дата/)?.[1] ?? "",
      format,
      players: personal.size,
      results,
    });
    console.log(`iMafia ${id}: ${results.length} of ours`);
  }
  return tournaments;
}

// ---------- MafGame ----------

function readInertiaProps(html) {
  const encoded = html.match(/data-page="([^"]+)"/)?.[1];
  if (!encoded) throw new Error("MafGame page data not found");
  const json = encoded
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  return JSON.parse(json).props;
}

async function listMafgame(schedule, keep) {
  const found = [];
  for (let page = 1; page <= 10; page++) {
    const { search_results: results } = readInertiaProps(
      await fetchText(`${MAFGAME}/tournaments?s=${schedule}&page=${page}`),
    );
    found.push(...results.data.filter(keep));
    if (page >= results.last_page || !results.data.every(keep)) break;
  }
  return found;
}

async function readMafgame(period, roster) {
  const byNick = new Map(roster.map((player) => [normalizeNick(player.nick), player]));
  const recent = (tournament) =>
    tournament.start_date >= addDays(period.start, -7) && tournament.start_date <= period.end;
  const listed = new Map();
  // Finished events stay under "planned" until their organiser closes them.
  for (const schedule of ["planned", "past"]) {
    for (const tournament of await listMafgame(schedule, recent)) listed.set(tournament.id, tournament);
  }

  const tournaments = [];
  for (const { id } of listed.values()) {
    const results = readInertiaProps(await fetchText(`${MAFGAME}/tournaments/${id}/results`));
    const tournament = results.tournament;
    const end = addDays(tournament.start_date, (tournament.days || 1) - 1);
    if (end < period.start || end > period.end) continue;

    const points = readInertiaProps(await fetchText(`${MAFGAME}/tournaments/${id}/points`)).points ?? [];
    const placeOf = new Map(points.map((row) => [row.user_id, row.position]));
    const nameOf = new Map(points.map((row) => [row.user_id, row.user?.display_name ?? ""]));
    const stages = Object.values(results.players ?? {});
    const participants = new Map(
      stages.flatMap((stage) => Object.values(stage)).map((player) => [player.user_id, player]),
    );

    const ours = [...participants.values()].flatMap((player) => {
      const member = byNick.get(normalizeNick(player.nickname));
      // Places appear once the organiser publishes the final points.
      if (!member || !isPlace(placeOf.get(player.user_id))) return [];
      // Nicks repeat across clubs, so also require the first name or the club to match.
      const firstName = member.name.split(" ")[0].toLowerCase();
      const name = (nameOf.get(player.user_id) ?? "").toLowerCase();
      if (player.club_id !== MAFGAME_CLUB_ID && !(firstName && name.startsWith(firstName))) return [];
      return [
        {
          nick: member.nick,
          group: member.group,
          place: placeOf.get(player.user_id),
          team: null,
          profileUrl: null,
        },
      ];
    });
    if (ours.length === 0) continue;

    tournaments.push({
      source: "MafGame",
      title: tournament.name,
      url: `${MAFGAME}/tournaments/${id}/view`,
      start: tournament.start_date,
      end,
      location: listed.get(id).city ?? "",
      format: tournament.teams ? "team" : tournament.serial ? "series" : "single",
      players: participants.size,
      results: ours,
    });
    console.log(`MafGame ${id}: ${ours.length} of ours`);
  }
  return tournaments;
}

async function main() {
  const period = lastPeriod(new Date());
  console.log(`Period ${period.start} – ${period.end}`);
  const roster = await readRoster();
  const tournaments = [...(await readImafia(period, roster)), ...(await readMafgame(period, roster))];
  for (const tournament of tournaments) tournament.results.sort((a, b) => a.place - b.place);
  tournaments.sort((a, b) => b.end.localeCompare(a.end) || a.title.localeCompare(b.title));

  // Write next to the file and swap it in, so an interrupted run never leaves half a JSON behind.
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, `${JSON.stringify({ period, tournaments }, null, 2)}\n`);
  await rename(tempFile, dataFile);
  console.log(`Saved ${tournaments.length} tournaments`);
}

await main();
