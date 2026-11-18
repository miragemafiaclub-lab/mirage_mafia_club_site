// Refreshes src/data/tournaments.json: upcoming tournaments (next ~3 months) on imafia.org and mafgame.org
// that the club's ЧК are registered for. Run daily by .github/workflows/sync-data.yml.
//
// Never breaks the daily job: if a source cannot be read (site down, markup changed), that source's entries
// from the previous file are kept, a warning is printed and the script still exits 0.
// The file is rewritten only when the tournaments change, so a quiet day leaves no diff.
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { addDays, fetchText, IMAFIA, MAFGAME, MAFGAME_CLUB_ID, readRosterFile } from "./lib/sources.mjs";
import {
  classify,
  countryOf,
  imafiaPlace,
  ourImafiaPlayers,
  ourMafgamePlayers,
  parseImafiaList,
  parseImafiaTournament,
  parseMafgameList,
  parseMafgameParticipants,
  sortTournaments,
} from "./lib/tournaments.mjs";

const dataFile = fileURLToPath(new URL("../src/data/tournaments.json", import.meta.url));
const indexFile = fileURLToPath(new URL("../src/data/player-index.json", import.meta.url));

/** How far ahead to look: about three months. */
const HORIZON_DAYS = 92;
/** Which roster groups count. The club asked for ЧК (full members); add "КЧК" here to include candidates. */
const GROUPS = new Set(["ЧК"]);
const MAX_LIST_PAGES = 10;

/** Today's date in Warsaw, whatever the machine's time zone. */
function warsawToday() {
  // en-CA writes dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const nickKey = (nick) => nick.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** ЧК from players.ts with their iMafia ids from the club's member list (player-index.json, kept by sync-rating). */
async function readRoster() {
  const roster = (await readRosterFile()).filter((player) => GROUPS.has(player.group));
  const index = JSON.parse(await readFile(indexFile, "utf8"));
  const ids = new Map();
  for (const member of index.members ?? []) ids.set(nickKey(member.nick), member.id);
  for (const player of index.players ?? []) if (!ids.has(nickKey(player.nick))) ids.set(nickKey(player.nick), player.id);
  for (const player of roster) player.imafiaId = ids.get(nickKey(player.nick)) ?? null;
  return roster;
}

function entry({ source, id, title, url, start, end, city, country, online, players }) {
  return {
    id: `${source.toLowerCase()}-${id}`,
    source,
    title,
    url,
    start,
    end,
    city,
    country,
    kind: classify({ online, country }),
    players,
  };
}

async function readImafia(window, roster) {
  const listed = [];
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const items = parseImafiaList(await fetchText(`${IMAFIA}/tournaments?page=${page}`));
    if (page === 1 && items.length === 0) throw new Error("iMafia: no tournaments on the list (markup changed?)");
    listed.push(...items);
    if (items.length === 0 || items.at(-1).start > window.last) break;
  }

  const tournaments = [];
  for (const item of listed) {
    if (item.start > window.last) continue;
    const page = parseImafiaTournament(await fetchText(`${IMAFIA}/tournament/${item.id}`));
    if (page.end < window.first) continue;
    const players = ourImafiaPlayers(page.participants, roster);
    if (players.length === 0) continue;
    const place = imafiaPlace(page.location || item.location, item.region);
    tournaments.push(
      entry({ source: "iMafia", id: item.id, title: page.title || item.title, url: `${IMAFIA}/tournament/${item.id}`, start: page.start, end: page.end, ...place, players }),
    );
    console.log(`iMafia ${item.id}: ${players.length} of ours`);
  }
  return tournaments;
}

async function readMafgame(window, roster) {
  const listed = [];
  for (let page = 1; page <= MAX_LIST_PAGES; page++) {
    const { items, lastPage } = parseMafgameList(await fetchText(`${MAFGAME}/tournaments?s=planned&page=${page}`));
    listed.push(...items);
    if (page >= lastPage || items.length === 0 || items.at(-1).start > window.last) break;
  }

  const tournaments = [];
  for (const item of listed) {
    // Finished events stay "planned" until closed: the start alone cannot rule them out, the length is on the page.
    if (item.cancelled || item.start > window.last || item.start < addDays(window.first, -14)) continue;
    const page = parseMafgameParticipants(await fetchText(`${MAFGAME}/tournaments/${item.id}/participants`));
    const end = addDays(page.start, page.days - 1);
    if (page.cancelled || end < window.first) continue;
    const players = ourMafgamePlayers(page.players, roster, MAFGAME_CLUB_ID);
    if (players.length === 0) continue;
    const online = item.online || page.online;
    tournaments.push(
      entry({
        source: "MafGame",
        id: String(item.id),
        title: item.title,
        url: `${MAFGAME}/tournaments/${item.id}/view`,
        start: page.start,
        end,
        city: online ? "" : item.city,
        country: online ? null : (countryOf(item.country ?? "") ?? item.country ?? countryOf(item.city)),
        online,
        players,
      }),
    );
    console.log(`MafGame ${item.id}: ${players.length} of ours`);
  }
  return tournaments;
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    return { updated: null, tournaments: [] };
  }
}

async function main() {
  const first = warsawToday();
  const window = { first, last: addDays(first, HORIZON_DAYS) };
  const previous = await readPrevious();
  const roster = await readRoster();
  console.log(`Window ${window.first} – ${window.last}, ${roster.length} players (${[...GROUPS].join(", ")})`);

  const tournaments = [];
  for (const [source, read] of [["iMafia", readImafia], ["MafGame", readMafgame]]) {
    try {
      tournaments.push(...(await read(window, roster)));
    } catch (error) {
      // Keep what we knew from this source (minus anything already over) and carry on.
      const kept = previous.tournaments.filter((t) => t.source === source && t.end >= window.first);
      tournaments.push(...kept);
      console.warn(`::warning::${source} could not be read, kept ${kept.length} previous entries: ${error.message}`);
    }
  }
  sortTournaments(tournaments);

  if (JSON.stringify(tournaments) === JSON.stringify(previous.tournaments)) {
    console.log(`No changes (${tournaments.length} tournaments)`);
    return;
  }
  // "updated" is the day the list last changed, not the day it was checked: no daily diff for nothing.
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, `${JSON.stringify({ updated: first, tournaments }, null, 2)}\n`);
  await rename(tempFile, dataFile);
  console.log(`Saved ${tournaments.length} tournaments`);
}

try {
  await main();
} catch (error) {
  // Anything unexpected (players.ts unreadable, a bug): leave the old file and let the rest of the sync run.
  console.warn(`::warning::Tournament sync failed, previous data kept: ${error.stack ?? error}`);
}
