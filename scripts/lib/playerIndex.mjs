// The small list of rating players the site needs on every page (to build /players/<slug> addresses),
// kept apart from the big rating.json and profiles.json, which only the rating and player pages load.
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const files = {
  rating: fileURLToPath(new URL("../../src/data/rating.json", import.meta.url)),
  profiles: fileURLToPath(new URL("../../src/data/profiles.json", import.meta.url)),
  index: fileURLToPath(new URL("../../src/data/player-index.json", import.meta.url)),
  thumbs: fileURLToPath(new URL("../../public/thumbs/", import.meta.url)),
};

/**
 * { members: [{id, nick}], players: [{id, nick, avatar?, thumb?}] } — newest nick for each id; avatar only for
 * guests that have one; thumb (1) when public/thumbs/<id>.jpg exists.
 */
export function buildPlayerIndex(rating, profiles, thumbs = new Set()) {
  const nicks = new Map();
  for (const league of rating.leagues) {
    for (const season of league.seasons) {
      for (const [id, nick] of Object.entries(season.nicks)) if (!nicks.has(id)) nicks.set(id, nick);
    }
  }
  const players = [...nicks].map(([id, nick]) => ({
    id,
    nick,
    ...(profiles[id]?.avatar && { avatar: profiles[id].avatar }),
    ...(thumbs.has(id) && { thumb: 1 }),
  }));
  return { members: rating.members ?? [], players };
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

export async function writePlayerIndex() {
  const thumbs = new Set((await readdir(files.thumbs).catch(() => [])).map((f) => f.match(/^(\d+)\.jpg$/)?.[1]).filter(Boolean));
  const index = buildPlayerIndex(await readJson(files.rating, { leagues: [] }), await readJson(files.profiles, {}), thumbs);
  await writeFile(`${files.index}.tmp`, `${JSON.stringify(index)}\n`);
  await rename(`${files.index}.tmp`, files.index);
}
