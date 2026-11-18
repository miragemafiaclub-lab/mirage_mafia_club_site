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

  it("renders a player's profile with their nick", () => {
    expect(render("/players/walle").html).toContain(">Walle<");
  });
});
