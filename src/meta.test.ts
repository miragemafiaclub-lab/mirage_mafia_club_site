import { describe, expect, it } from "vitest";
import { headHtml, headTags, pageMeta } from "./meta";
import { prerenderPaths, resolveRoute } from "./routes";
import { SITE_URL } from "./site";

const metaFor = (path: string) => pageMeta(resolveRoute(path));

describe("page meta", () => {
  it("gives every page its own canonical address, and every searchable page its own title", () => {
    const paths = prerenderPaths();
    expect(new Set(paths.map((p) => metaFor(p).canonical)).size).toBe(paths.length);
    // Guests can share a nick (different iMafia accounts); their pages are not searchable for now.
    const searchable = paths.filter((p) => !metaFor(p).noindex);
    expect(new Set(searchable.map((p) => metaFor(p).title)).size).toBe(searchable.length);
  });

  it("uses full addresses built from the one site setting", () => {
    const m = metaFor("/en/players/walle");
    expect(m.canonical).toBe(`${SITE_URL}/en/players/walle`);
    expect(m.alternates).toEqual({ ru: `${SITE_URL}/players/walle`, en: `${SITE_URL}/en/players/walle` });
    expect(m.image.startsWith(SITE_URL)).toBe(true);
  });

  it("keeps placeholder and guest pages out of search results, but not real ones", () => {
    expect(metaFor("/tournaments").noindex).toBe(true);
    expect(metaFor("/players/grib-958").noindex).toBe(true);
    expect(metaFor("/").noindex).toBe(false);
    expect(metaFor("/rating").noindex).toBe(false);
    expect(metaFor("/en/first-time").noindex).toBe(false);
    expect(metaFor("/players/logika").noindex).toBe(false);
  });

  it("writes player pages in the page's language, nick as written", () => {
    expect(metaFor("/players/logika").title).toBe("Логика — игрок Mirage Mafia Club");
    expect(metaFor("/en/players/logika").title).toBe("Логика — Mirage Mafia Club player");
    expect(metaFor("/en/players/logika").description).toContain("Elvira Vezgeim");
  });

  it("escapes quotes and angle brackets in the HTML", () => {
    const html = headHtml([
      { tag: "title", text: 'A <b> "c"' },
      { tag: "meta", attrs: { name: "description", content: 'x" onload="y' } },
    ]);
    expect(html).toContain("<title>A &lt;b&gt; &quot;c&quot;</title>");
    expect(html).toContain('content="x&quot; onload=&quot;y"');
  });

  it("adds robots noindex only when asked", () => {
    const has = (path: string) => headTags(metaFor(path)).some((t) => t.tag === "meta" && t.attrs.name === "robots");
    expect(has("/tournaments")).toBe(true);
    expect(has("/")).toBe(false);
  });
});
