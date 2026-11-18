import { describe, expect, it } from "vitest";
import { prerenderPaths, render } from "./entry-server";

// The same rendering the build does: every page must come out as real HTML, not an empty shell.
describe("prerender", () => {
  it.each(prerenderPaths())("%s renders with a heading and its own head tags", (path) => {
    const page = render(path);
    expect(page.html).toContain("<h1");
    expect(page.head).toContain("<title>");
    expect(page.head).toContain('rel="canonical"');
    expect(page.lang).toBe(path.startsWith("/en") ? "en" : "ru");
  });

  it("puts the real content into the home page HTML", () => {
    const { html } = render("/");
    expect(html).toContain('id="schedule"');
    expect(html).toContain('id="players"');
    expect(html).toContain("players-card");
  });

  it("shows the club records under the rating, in both languages", () => {
    expect(render("/rating").html).toContain("Рекорды клуба");
    expect(render("/en/rating").html).toContain("Club records");
  });

  it("puts the whole first-visit guide into the HTML, in both languages", () => {
    const ru = render("/first-time");
    expect(ru.noindex).toBe(false);
    expect(ru.html).toContain("Ludna 2");
    expect(ru.html).toContain("60 zł");
    expect(ru.html).toContain("https://learnmafia.com");
    expect(ru.html).toContain("Вторник и пятница, 18:30");
    expect(render("/en/first-time").html).toContain("Tuesday and Friday, 18:30");
  });

  it("links the home page to the first-visit guide", () => {
    expect(render("/").html).toContain('href="/first-time"');
    expect(render("/en").html).toContain('href="/en/first-time"');
  });

  it("renders a player's profile with their nick", () => {
    expect(render("/players/walle").html).toContain(">Walle<");
  });
});
