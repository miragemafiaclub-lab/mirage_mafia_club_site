// Refreshes iMafia profile stats (roles, first blood, awards, prize places) into src/data/profiles.json
// for players in the club rating, a few per day (docs/decisions/0005-profile-sync.md).
// iMafia avatars go to public/players/<id>.jpg for everyone without the club's own photo on the site.
// Usage: node scripts/sync-profiles.mjs [limit]
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { parseProfileStats } from "./lib/imafia.mjs";
import { writePlayerIndex } from "./lib/playerIndex.mjs";
import { ownPhotoIds } from "./make-thumbs.mjs";
import { candidatesFrom, DAILY_LIMIT, pickProfiles, profileRecord } from "./lib/profiles.mjs";

const SITE = "https://imafia.org";
const USER_AGENT = "MirageMafiaClubSite/1.0 (+https://github.com/miragemafiaclub-lab/mirage_mafia_club_site)";
const PAUSE_MS = 2500;

const ratingFile = fileURLToPath(new URL("../src/data/rating.json", import.meta.url));
const profilesFile = fileURLToPath(new URL("../src/data/profiles.json", import.meta.url));
const avatarDir = fileURLToPath(new URL("../public/players/", import.meta.url));

const pause = () => new Promise((resolve) => setTimeout(resolve, PAUSE_MS));

async function request(path) {
  await pause();
  const response = await fetch(SITE + path, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

async function saveAvatar(id, photoPath) {
  const image = await request(photoPath);
  const bytes = await sharp(Buffer.from(await image.arrayBuffer()))
    .rotate()
    .resize(480, 640, { fit: "cover", withoutEnlargement: true })
    .flatten({ background: "#0a0a0a" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  await mkdir(avatarDir, { recursive: true });
  await writeFile(`${avatarDir}${id}.jpg`, bytes);
  return `players/${id}.jpg`;
}

async function main() {
  const limit = Number(process.argv[2]) || DAILY_LIMIT;
  const rating = JSON.parse(await readFile(ratingFile, "utf8"));
  let stored = {};
  try {
    stored = JSON.parse(await readFile(profilesFile, "utf8"));
  } catch {
    // First run: nothing stored yet.
  }

  const candidates = candidatesFrom(rating);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const now = Date.now();
  const picked = pickProfiles(candidates, stored, now, limit);

  const own = await ownPhotoIds();
  let failed = 0;
  for (const id of picked) {
    try {
      const stats = parseProfileStats(await (await request(`/u/${id}`)).text());
      const player = byId.get(id);
      // Players with the club's own photo keep it; everyone else gets their iMafia avatar, if they have one.
      const avatar = !own.has(id) && stats.photoPath ? await saveAvatar(id, stats.photoPath) : (stored[id]?.avatar ?? null);
      stored[id] = profileRecord(stats, { games: player.games, now, avatar });
      console.log(`${player.nick}: ${stats.tournaments.length} tournaments, ${stored[id].prizes.length} prize places`);
    } catch (error) {
      // One broken profile must not lose the others: keep its old data and go on.
      failed += 1;
      console.warn(`${id}: ${error.message}`);
    }
  }
  if (picked.length > 0 && failed === picked.length) throw new Error("Every profile failed; keeping the old data");

  const sorted = Object.fromEntries(Object.entries(stored).sort(([a], [b]) => Number(a) - Number(b)));
  await writeFile(`${profilesFile}.tmp`, `${JSON.stringify(sorted)}\n`);
  await rename(`${profilesFile}.tmp`, profilesFile);
  await writePlayerIndex();
  console.log(`Profiles: ${picked.length - failed} refreshed, ${Object.keys(sorted).length} stored, ${candidates.length - Object.keys(sorted).length} still to fetch`);
}

await main();
