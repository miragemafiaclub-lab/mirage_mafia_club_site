// Production build: the browser bundle, then every page saved as ready-made HTML (prerender).
// Why prerender: docs/decisions/0001-prerender.md. Run with `npm run build`.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import { fillTemplate } from "./lib/template.mjs";

// One "now" for the whole build, so the bundle and the HTML agree (see vite.config.ts).
process.env.BUILD_TIME ||= String(Date.now());

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const serverOut = join(root, "node_modules/.prerender");

// 1. The site as the browser gets it.
await build({ root, logLevel: "warn" });

// 2. The same app compiled for Node, only to render pages here.
await build({
  root,
  logLevel: "warn",
  build: { ssr: "src/entry-server.tsx", outDir: serverOut, emptyOutDir: true, copyPublicDir: false },
});
const { render, prerenderPaths, SITE_URL } = await import(pathToFileURL(join(serverOut, "entry-server.js")).href);

// 3. Every page into the HTML template.
const template = await readFile(join(dist, "index.html"), "utf8");
for (const marker of ["<!--head-start-->", "<!--head-end-->", "<!--app-html-->", '<html lang="ru">']) {
  if (!template.includes(marker)) throw new Error(`index.html: marker ${marker} is missing`);
}

const indexable = [];
const paths = prerenderPaths();
const dataFiles = new Map();
for (const path of paths) {
  const page = render(path);
  // A page without a heading means something rendered empty: stop the deploy rather than publish it.
  if (!page.html.includes("<h1")) throw new Error(`${path}: rendered without an <h1>`);
  const html = fillTemplate(template, page);
  if (page.pageData) dataFiles.set(page.pageData.url, page.pageData.data);
  // "/rating" → rating.html: served at the clean address by Vercel (cleanUrls) and by `vite preview`.
  const file = path === "/" ? join(dist, "index.html") : join(dist, `${path.slice(1)}.html`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  if (!page.noindex) indexable.push(path);
}

// 4. The same data as files, for moving between pages without a reload (src/pageData.tsx).
for (const [url, data] of dataFiles) {
  const file = join(dist, url.slice(1));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data));
}

// 5. For search engines: which pages exist, and where that list is.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemap);
await writeFile(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

await rm(serverOut, { recursive: true, force: true });
console.log(`Prerendered ${paths.length} pages (${indexable.length} in sitemap) for ${SITE_URL}`);
