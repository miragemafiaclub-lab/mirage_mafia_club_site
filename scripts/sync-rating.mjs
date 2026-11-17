// Refreshes the club rating from iMafia (https://imafia.org/club/35) into src/data/rating.json,
// and records each finished month's winner in src/data/winners.json (once, never overwritten).
// Runs daily from .github/workflows/sync-data.yml. Gentle on iMafia: ~15 requests, paused, with a clear User-Agent.
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { assignYears, parseLeagues, parseMembers, parseMvp, parseProfile, parseRatingTable } from "./lib/imafia.mjs";
import { mergeSeason, newWinners } from "./lib/rating.mjs";

const SITE = "https://imafia.org";
const CLUB_ID = "35";
const MONTH_LEAGUE = "Month Rating";
const USER_AGENT = "MirageMafiaClubSite/1.0 (+https://github.com/miragemafiaclub-lab/mirage_mafia_club_site)";
const PAUSE_MS = 1500;

const ratingFile = fileURLToPath(new URL("../src/data/rating.json", import.meta.url));
const winnersFile = fileURLToPath(new URL("../src/data/winners.json", import.meta.url));
const photoDir = fileURLToPath(new URL("../public/winners/", import.meta.url));

const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

async function request(path, init = {}) {
  await pause();
  const response = await fetch(SITE + path, { ...init, headers: { "User-Agent": USER_AGENT, ...init.headers } });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

async function fetchRating(leagueId, seasonId) {
  const response = await request("/aiax/main/club_rating", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
    body: new URLSearchParams({
      clubs_id: CLUB_ID,
      leagues_id: leagueId,
      season_id: seasonId,
      form_id: "club_rating_form",
      lang_id: "2",
    }),
  });
  const data = await response.json();
  if (String(data.status) !== "1") throw new Error(`rating ${leagueId}/${seasonId}: status ${data.status}`);
  const { rows, cutoff } = parseRatingTable(data.items_html ?? "");
  return { rows, cutoff, games: Number(data.total_games) || 0, mvp: parseMvp(data.nominations) };
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

// Write to a temp file and rename, so an interrupted run never leaves a truncated file.
async function writeJson(file, data, indent = 2) {
  await writeFile(`${file}.tmp`, `${JSON.stringify(data, null, indent)}\n`);
  await rename(`${file}.tmp`, file);
}

async function savePhoto(id, photoPath) {
  const image = await request(photoPath);
  // Avatars come as JPEG or heavy PNG; store every one as a compressed JPEG, at most 1000 px.
  const bytes = await sharp(Buffer.from(await image.arrayBuffer()))
    .rotate()
    .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#0a0a0a" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await mkdir(photoDir, { recursive: true });
  await writeFile(`${photoDir}${id}.jpg`, bytes);
  return `winners/${id}.jpg`;
}

async function main() {
  const now = new Date();
  const clubHtml = await (await request(`/club/${CLUB_ID}`)).text();
  const members = parseMembers(clubHtml);
  const old = await readJson(ratingFile, { leagues: [] });
  const oldSeasons = new Map(old.leagues.flatMap((l) => l.seasons.map((s) => [`${l.id}/${s.id}`, s])));

  const leagues = [];
  for (const league of parseLeagues(clubHtml)) {
    const seasons = [];
    for (const season of assignYears(league.seasons, now)) {
      const fresh = await fetchRating(league.id, season.id);
      console.log(`${league.name} / ${season.name || "all time"}: ${fresh.rows.length} players`);
      seasons.push(mergeSeason({ ...season, ...fresh }, oldSeasons.get(`${league.id}/${season.id}`)));
    }
    leagues.push({ id: league.id, name: league.name, seasons });
  }
  const total = leagues.reduce((sum, l) => sum + l.seasons.reduce((s, x) => s + x.rows.length, 0), 0);
  if (total === 0) throw new Error("iMafia returned no rating rows at all; keeping the old data");

  // Player of the month: #1 of the Month Rating once the month is over. Recorded once, never changed.
  const winners = await readJson(winnersFile, {});
  const monthLeague = leagues.find((l) => l.name === MONTH_LEAGUE);
  for (const winner of newWinners(monthLeague?.seasons ?? [], winners, now)) {
    const profile = parseProfile(await (await request(`/u/${winner.id}`)).text());
    winners[winner.key] = {
      nick: winner.nick,
      rank: profile.rank,
      photo: profile.photoPath ? await savePhoto(winner.id, profile.photoPath) : null,
      profileUrl: `${SITE}/u/${winner.id}`,
    };
    console.log(`Player of ${winner.key}: ${winner.nick}`);
  }

  // Only a real change moves updatedAt, so an unchanged day makes no commit.
  const next = { leagues, members };
  const changed = JSON.stringify(next) !== JSON.stringify({ leagues: old.leagues, members: old.members });
  // Compact (no indentation): it is the biggest data file and nobody edits it by hand.
  await writeJson(ratingFile, { updatedAt: changed ? now.toISOString() : old.updatedAt, ...next }, 0);
  await writeJson(winnersFile, Object.fromEntries(Object.entries(winners).sort(([a], [b]) => a.localeCompare(b))));
  console.log(changed ? `Saved ${total} rating rows` : "Rating unchanged");
}

await main();
