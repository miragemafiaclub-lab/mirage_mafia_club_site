import { describe, expect, it } from "vitest";
import { CLUB_PLAYERS } from "./data/playerDirectory";
import { localize, prerenderPaths, resolveRoute, splitLang, switchLang } from "./routes";

describe("language in the address", () => {
  it("keeps Russian at the plain path and puts English under /en", () => {
    expect(localize("/", "ru")).toBe("/");
    expect(localize("/", "en")).toBe("/en");
    expect(localize("/rating", "en")).toBe("/en/rating");
  });

  it("reads the language and path back, ignoring stray slashes", () => {
    expect(splitLang("/")).toEqual({ lang: "ru", path: "/" });
    expect(splitLang("/en")).toEqual({ lang: "en", path: "/" });
    expect(splitLang("/en/")).toEqual({ lang: "en", path: "/" });
    expect(splitLang("/en/players/logika/")).toEqual({ lang: "en", path: "/players/logika" });
    expect(splitLang("//rating//")).toEqual({ lang: "ru", path: "/rating" });
  });

  it("does not mistake a path that merely starts with 'en' for English", () => {
    expect(splitLang("/english")).toEqual({ lang: "ru", path: "/english" });
  });

  it("switches the same page to the other language", () => {
    expect(switchLang("/players/logika", "en")).toBe("/en/players/logika");
    expect(switchLang("/en/rating", "ru")).toBe("/rating");
    expect(switchLang("/en", "ru")).toBe("/");
  });
});

describe("resolveRoute", () => {
  it("finds every kind of page", () => {
    expect(resolveRoute("/").page).toBe("home");
    expect(resolveRoute("/en/rating").page).toBe("rating");
    expect(resolveRoute("/tournaments").page).toBe("tournaments");
    expect(resolveRoute("/en/first-time").page).toBe("firstTime");
    const route = resolveRoute("/players/logika");
    expect(route.page).toBe("player");
    expect(route.page === "player" && route.player.nick).toBe("Логика");
  });

  it("returns notFound for unknown pages and players", () => {
    expect(resolveRoute("/nope").page).toBe("notFound");
    expect(resolveRoute("/players/no-such-player").page).toBe("notFound");
    expect(resolveRoute("/players/logika/extra").page).toBe("notFound");
  });
});

describe("prerenderPaths", () => {
  const paths = prerenderPaths();

  it("lists every page once in both languages", () => {
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.length).toBe(2 * (5 + CLUB_PLAYERS.length));
    expect(paths).toContain("/");
    expect(paths).toContain("/en/first-time");
  });

  it("only lists addresses that resolve to a real page", () => {
    for (const path of paths) expect(resolveRoute(path).page, path).not.toBe("notFound");
  });
});
