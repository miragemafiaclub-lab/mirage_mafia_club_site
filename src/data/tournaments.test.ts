import { describe, expect, it } from "vitest";
import {
  dateBadge,
  filterTournaments,
  formatDateRange,
  parseFilter,
  playerPage,
  TOURNAMENTS,
  type Tournament,
} from "./tournaments";

const t = (id: string, kind: Tournament["kind"]): Tournament => ({
  id,
  source: "iMafia",
  title: id,
  url: "",
  start: "2026-11-21",
  end: "2026-11-22",
  city: "",
  country: null,
  kind,
  players: [],
});

describe("tournament filters", () => {
  it("reads ?f= and falls back to Europe", () => {
    expect(parseFilter("online")).toBe("online");
    expect(parseFilter("all")).toBe("all");
    expect(parseFilter(null)).toBe("europe");
    expect(parseFilter("mars")).toBe("europe");
  });

  it("shows unknown places only under «Все»", () => {
    const list = [t("a", "europe"), t("b", "online"), t("c", "other")];
    expect(filterTournaments(list, "europe").map((x) => x.id)).toEqual(["a"]);
    expect(filterTournaments(list, "online").map((x) => x.id)).toEqual(["b"]);
    expect(filterTournaments(list, "all").map((x) => x.id)).toEqual(["a", "b", "c"]);
  });
});

describe("tournament dates", () => {
  it("writes ranges without repeating the month or year", () => {
    expect(formatDateRange("2026-11-21", "2026-11-22", "ru")).toBe("21–22 ноября 2026");
    expect(formatDateRange("2026-11-30", "2026-12-01", "en")).toBe("30 November – 1 December 2026");
    expect(formatDateRange("2026-12-31", "2027-01-01", "ru")).toBe("31 декабря 2026 – 1 января 2027");
    expect(formatDateRange("2026-12-05", "2026-12-05", "en")).toBe("5 December 2026");
  });

  it("gives the badge's day and month", () => {
    expect(dateBadge("2026-11-21", "2026-11-22", "ru")).toEqual({ day: "21–22", month: "ноя" });
    expect(dateBadge("2026-11-30", "2026-12-01", "en")).toEqual({ day: "30–1", month: "Nov–Dec" });
  });
});

describe("tournaments.json", () => {
  it("is sorted by start date and every player has a page on the site", () => {
    const starts = TOURNAMENTS.map((x) => x.start);
    expect(starts).toEqual([...starts].sort());
    for (const tournament of TOURNAMENTS) {
      expect(tournament.players.length).toBeGreaterThan(0);
      for (const player of tournament.players) expect(playerPage(player), player.nick).toBeDefined();
    }
  });
});
