// Helpers shared by the scripts that read tournaments from imafia.org and mafgame.org
// (sync-podium.mjs, sync-tournaments.mjs). Network only in fetchText; the rest works on text.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const IMAFIA = "https://imafia.org";
export const MAFGAME = "https://mafgame.org";
export const IMAFIA_CLUB_ID = "35";
export const MAFGAME_CLUB_ID = 62;

const playersFile = fileURLToPath(new URL("../../src/data/players.ts", import.meta.url));

// A plain browser-like agent: the sites serve their normal pages to it. No contact details on purpose.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const pause = () => new Promise((resolve) => setTimeout(resolve, 700));

/** One page at a time with a pause before each, so the sites never see a burst from us. */
export async function fetchText(url) {
  await pause();
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/** Text of an HTML fragment; tags become spaces, so cells stay apart ("Дата 21.11.2026"). */
export function stripTags(html) {
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
export function normalizeNick(nick) {
  return nick.normalize("NFKC").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
}

export function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  return isoDate(new Date(year, month - 1, day + days));
}

/** MafGame is an Inertia app: each page carries its data as JSON in data-page="…". */
export function readInertiaProps(html) {
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

/** ЧК and КЧК as listed in src/data/players.ts: [{ nick, name, group: "ЧК" | "КЧК" }]. */
export function parseRoster(source) {
  const split = source.indexOf("export const KCHK_BASE");
  const parse = (part, group) =>
    [...part.matchAll(/^ {4}nick: "([^"]+)",\n {4}name: "([^"]*)"/gm)].map((match) => ({
      nick: match[1],
      name: match[2],
      group,
    }));
  const roster = [...parse(source.slice(0, split), "ЧК"), ...parse(source.slice(split), "КЧК")];
  if (split === -1 || roster.length === 0) throw new Error(`No players read from ${playersFile}`);
  return roster;
}

export async function readRosterFile() {
  return parseRoster(await readFile(playersFile, "utf8"));
}

/** iMafia ids of the club's members, from the member list on /club/35: Map nick → id. */
export function parseClubMemberIds(clubHtml) {
  const ids = new Map();
  for (const match of clubHtml.matchAll(/href="\/u\/(\d+)"[^>]*>(.*?)<\/a>/gs)) {
    const label = stripTags(match[2]);
    if (label.includes("●")) ids.set(label.split("●")[0].trim(), match[1]);
  }
  return ids;
}
