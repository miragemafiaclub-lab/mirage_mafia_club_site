// The small list of rating players the site needs on every page (to build /players/<slug> addresses),
// kept apart from the big rating.json and profiles.json, which only the rating and player pages load.
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const files = {
  rating: fileURLToPath(new URL("../../src/data/rating.json", import.meta.url)),
  profiles: fileURLToPath(new URL("../../src/data/profiles.json", import.meta.url)),
  index: fileURLToPath(new URL("../../src/data/player-index.json", import.meta.url)),
};

/** { members: [{id, nick}], players: [{id, nick, avatar?}] } — newest nick for each id, avatar only for guests that have one. */
export function buildPlayerIndex(rating, profiles) {
  const nicks = new Map();
  for (const league of rating.leagues) {
    for (const season of league.seasons) {
      for (const [id, nick] of Object.entries(season.nicks)) if (!nicks.has(id)) nicks.set(id, nick);
    }
  }
  const players = [...nicks].map(([id, nick]) => (profiles[id]?.avatar ? { id, nick, avatar: profiles[id].avatar } : { id, nick }));
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
  const index = buildPlayerIndex(await readJson(files.rating, { leagues: [] }), await readJson(files.profiles, {}));
  await writeFile(`${files.index}.tmp`, `${JSON.stringify(index)}\n`);
  await rename(`${files.index}.tmp`, files.index);
}
