// Web-sized copies of the site's photos: `npm run images`. Re-run after replacing a source photo.
//
// 1. Sources in src/assets (hero, About, logo) stay as the masters; the WebP copies the components import
//    are written to src/assets/web/<name>-<width>.webp. Never upscaled: a source narrower than a target
//    width gets one copy at its own width.
// 2. Player photos (src/assets/players) are recompressed in place, as JPEG (they are also the og:image of
//    profile pages, where WebP is not safe), and only when that saves at least 15%. Already-optimized files
//    are skipped, so running it again changes nothing.
import { readdir, rename, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("..", import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));

/** source → widths to make, plus WebP quality. */
const WEB_COPIES = [
  // Full-screen background (object-fit: cover); the source is only 861 px wide, so 861 is the top size.
  { source: "hero-table.jpeg", widths: [640, 861], quality: 78 },
  // About collage: columns are at most ~245 px wide on desktop, ~150 px on phones.
  { source: "about-accent.jpeg", widths: [640], quality: 76 },
  { source: "about-awards.jpeg", widths: [640], quality: 76 },
  { source: "about-group.jpeg", widths: [640], quality: 76 },
  { source: "about-main.jpeg", widths: [640], quality: 76 },
  { source: "about-podium.jpeg", widths: [640], quality: 76 },
  { source: "about-small.jpeg", widths: [589], quality: 78 },
  { source: "about-trophies.jpeg", widths: [640], quality: 76 },
  // Header (44 px, so 128 covers 3x screens) and the Winners frame/watermark (up to 480 px).
  { source: "logo.jpeg", widths: [128, 480], quality: 82 },
];

const PLAYER_MAX = 1000; // the profile photo is up to 380 px wide (3:4), so 1000 px tall covers 2x screens
const PLAYER_QUALITY = 80;
const MIN_SAVING = 0.15;

const kb = (n) => `${Math.round(n / 1024)} KB`;

async function webCopies() {
  for (const { source, widths, quality } of WEB_COPIES) {
    const input = path(`src/assets/${source}`);
    const { width: sourceWidth } = await sharp(input).metadata();
    const name = source.replace(/\.\w+$/, "");
    for (const width of new Set(widths.map((w) => Math.min(w, sourceWidth)))) {
      const out = path(`src/assets/web/${name}-${width}.webp`);
      const info = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: true })
        .toFile(out);
      console.log(`web/${name}-${width}.webp  ${info.width}×${info.height}  ${kb(info.size)}`);
    }
  }
}

async function playerPhotos() {
  const dir = "src/assets/players";
  for (const file of (await readdir(path(dir))).filter((f) => /\.jpe?g$/i.test(f))) {
    const input = path(`${dir}/${file}`);
    const before = (await stat(input)).size;
    const buffer = await sharp(input)
      .rotate()
      .resize(PLAYER_MAX, PLAYER_MAX, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: PLAYER_QUALITY, mozjpeg: true })
      .toBuffer();
    if (buffer.length > before * (1 - MIN_SAVING)) continue;
    await writeFile(`${input}.tmp`, buffer);
    await rename(`${input}.tmp`, input);
    console.log(`players/${file}  ${kb(before)} → ${kb(buffer.length)}`);
  }
}

await webCopies();
await playerPhotos();
