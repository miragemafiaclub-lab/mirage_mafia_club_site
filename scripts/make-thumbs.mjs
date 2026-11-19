// Small round-photo thumbnails (96×96, ~3 KB) for tables: public/thumbs/<iMafia id>.jpg.
// Sources: the club's own photos (src/assets/players, matched to iMafia ids through src/data/players.ts)
// and iMafia avatars (public/players) for everyone else. Only missing or outdated thumbnails are made.
// Runs after the profile sync and on `npm run thumbs`.
import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { writePlayerIndex } from "./lib/playerIndex.mjs";

const root = new URL("..", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));
const SIZE = 96;

const nickKey = (nick) => nick.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** nick → photo file, read from the imports and entries of players.ts. */
export function rosterPhotos(playersTs) {
  const files = new Map([...playersTs.matchAll(/import (\w+) from "\.\.\/assets\/players\/([^"]+)";/g)].map((m) => [m[1], m[2]]));
  const photos = new Map();
  for (const m of playersTs.matchAll(/nick: "([^"]+)",[\s\S]*?(?=\n  \{|\n\];)/g)) {
    const variable = m[0].match(/photo: (\w+)/)?.[1];
    if (variable && files.has(variable)) photos.set(m[1], files.get(variable));
  }
  return photos;
}

/** iMafia ids of roster players with the club's own photo: their iMafia avatar is never used. */
export async function ownPhotoIds() {
  const index = JSON.parse(await readFile(path("src/data/player-index.json"), "utf8"));
  const idByNick = new Map([...index.players, ...index.members].map((p) => [nickKey(p.nick), p.id]));
  const photos = rosterPhotos(await readFile(path("src/data/players.ts"), "utf8"));
  return new Set([...photos.keys()].map((nick) => idByNick.get(nickKey(nick))).filter(Boolean));
}

async function newer(source, target) {
  try {
    return (await stat(source)).mtimeMs > (await stat(target)).mtimeMs;
  } catch {
    return true;
  }
}

async function makeThumb(source, id) {
  const target = path(`public/thumbs/${id}.jpg`);
  if (!(await newer(source, target))) return false;
  await sharp(source)
    .rotate()
    .resize(SIZE, SIZE, { fit: "cover", position: sharp.strategy.attention })
    .flatten({ background: "#0a0a0a" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(target);
  return true;
}

async function main() {
  await mkdir(path("public/thumbs"), { recursive: true });
  const index = JSON.parse(await readFile(path("src/data/player-index.json"), "utf8"));
  const idByNick = new Map([...index.players, ...index.members].map((p) => [nickKey(p.nick), p.id]));
  let made = 0;

  for (const [nick, file] of rosterPhotos(await readFile(path("src/data/players.ts"), "utf8"))) {
    const id = idByNick.get(nickKey(nick));
    if (id && (await makeThumb(path(`src/assets/players/${file}`), id))) made += 1;
  }
  // The club's own photo wins over an iMafia avatar.
  const own = await ownPhotoIds();
  for (const file of await readdir(path("public/players")).catch(() => [])) {
    const id = file.match(/^(\d+)\.jpg$/)?.[1];
    if (id && !own.has(id) && (await makeThumb(path(`public/players/${file}`), id))) made += 1;
  }
  await writePlayerIndex();
  console.log(`Thumbnails: ${made} made`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
