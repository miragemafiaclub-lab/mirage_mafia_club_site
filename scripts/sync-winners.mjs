// Refreshes src/data/winners.json and public/winners/ from the club's iMafia "Month Rating" league.
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SITE = "https://imafia.org";
const CLUB_ID = "35";
const LEAGUE_NAME = "Month Rating";
const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const dataFile = fileURLToPath(new URL("../src/data/winners.json", import.meta.url));
const photoDir = fileURLToPath(new URL("../public/winners/", import.meta.url));

const pause = () => new Promise((resolve) => setTimeout(resolve, 700));

async function request(path, init) {
  const response = await fetch(SITE + path, init);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();
}

function readSeasons(clubHtml) {
  const leagues = clubHtml.match(/<select[^>]*id="leagues_id".*?<\/select>/s)?.[0] ?? "";
  const leagueId = [...leagues.matchAll(/<option value="(\d+)"[^>]*>([^<]*)/g)].find(
    (option) => option[2].trim() === LEAGUE_NAME,
  )?.[1];
  if (!leagueId) throw new Error(`League "${LEAGUE_NAME}" not found`);

  const options = clubHtml.match(/<select id="leagues_season_id">.*?<\/select>/s)?.[0] ?? "";
  const seasons = [...options.matchAll(/<option value="(\d+)" data-leagues-id="(\d+)">([^<]*)/g)]
    .filter((option) => option[2] === leagueId)
    .map((option) => ({
      id: option[1],
      month: MONTHS_RU.findIndex((name) => option[3].trim().endsWith(name)),
    }))
    .filter((season) => season.month !== -1)
    .sort((a, b) => Number(b.id) - Number(a.id));
  if (seasons.length === 0) throw new Error("No monthly seasons found");
  return { leagueId, seasons };
}

// Season names have no year, so it is inferred walking from the newest season back.
function assignYears(seasons, now) {
  let year = seasons[0].month > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
  return seasons.map((season, index) => {
    if (index > 0 && season.month >= seasons[index - 1].month) year -= 1;
    return { ...season, year };
  });
}

async function readTopPlayer(leagueId, seasonId) {
  const response = await request("/aiax/main/club_rating", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: new URLSearchParams({
      clubs_id: CLUB_ID,
      leagues_id: leagueId,
      season_id: seasonId,
      form_id: "club_rating_form",
      lang_id: "2",
    }),
  });
  const data = await response.json();
  const firstRow = data.items_html?.match(/<tr[^>]*>(.*?)<\/tr>/s)?.[1] ?? "";
  const cells = [...firstRow.replace(/<!--.*?-->/gs, "").matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((cell) => cell[1]);
  const link = cells[1]?.match(/href="\/u\/(\d+)"/);
  if (stripTags(cells[0] ?? "") !== "1" || !link) return null;
  return { id: link[1], nick: stripTags(cells[1]) };
}

async function readProfile(id) {
  const html = await (await request(`/u/${id}`)).text();
  const avatarAt = html.indexOf("content_user_page_avatar");
  const avatarBlock = avatarAt === -1 ? "" : html.slice(avatarAt, avatarAt + 800);
  return {
    photoPath: avatarBlock.match(/\/uploads\/users\/middle\/[^"']+/)?.[0],
    rank: html.match(/<td>Rank<\/td>\s*<td>\s*([^<(]+)/)?.[1].trim() ?? "",
  };
}

async function main() {
  const now = new Date();
  const clubHtml = await (await request(`/club/${CLUB_ID}`)).text();
  const { leagueId, seasons } = readSeasons(clubHtml);
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  const finished = assignYears(seasons, now).filter((season) => season.year * 12 + season.month < currentMonth);

  const winners = {};
  const profiles = new Map();
  for (const season of finished) {
    const key = `${season.year}-${String(season.month + 1).padStart(2, "0")}`;
    await pause();
    const top = await readTopPlayer(leagueId, season.id);
    if (!top) {
      console.warn(`${key}: no first place found, skipped`);
      continue;
    }
    if (!profiles.has(top.id)) {
      await pause();
      profiles.set(top.id, await readProfile(top.id));
    }
    winners[key] = { id: top.id, nick: top.nick, rank: profiles.get(top.id).rank };
    console.log(`${key}: ${top.nick}`);
  }
  if (Object.keys(winners).length === 0) throw new Error("No winners found, nothing written");

  const photos = new Map();
  for (const [id, profile] of profiles) {
    if (!profile.photoPath) continue;
    await pause();
    const image = await request(profile.photoPath);
    // The avatar URL may carry a cache-busting query; keep it out of the file name.
    const extension = profile.photoPath.split(/[?#]/)[0].split(".").pop().toLowerCase();
    photos.set(id, { name: `${id}.${extension}`, bytes: Buffer.from(await image.arrayBuffer()) });
  }

  // Write the new photos first and remove stale ones only after winners.json is in place,
  // so a failure halfway never leaves the data pointing at deleted files.
  await mkdir(photoDir, { recursive: true });
  for (const { name, bytes } of photos.values()) await writeFile(photoDir + name, bytes);

  const output = Object.fromEntries(
    Object.entries(winners)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, winner]) => [
        key,
        {
          nick: winner.nick,
          rank: winner.rank,
          photo: photos.has(winner.id) ? `winners/${photos.get(winner.id).name}` : null,
          profileUrl: `${SITE}/u/${winner.id}`,
        },
      ]),
  );
  // Write to a temp file and rename, so an interrupted run cannot leave a truncated winners.json.
  await writeFile(`${dataFile}.tmp`, `${JSON.stringify(output, null, 2)}\n`);
  await rename(`${dataFile}.tmp`, dataFile);
  const kept = new Set([...photos.values()].map(({ name }) => name));
  for (const file of await readdir(photoDir)) if (!kept.has(file)) await rm(photoDir + file);
  console.log(`Saved ${Object.keys(output).length} winners`);
}

await main();
