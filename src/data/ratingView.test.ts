import { describe, expect, it } from "vitest";
import { unpackRating, type RatingRow, type Season, type StoredRating } from "./rating";
import ratingJson from "./rating.json";

const LEAGUES = unpackRating(ratingJson as StoredRating);
import {
  COLLAPSED_ROWS,
  filterRows,
  formatDate,
  formatNumber,
  leagueLabel,
  pickSelection,
  placeChange,
  seasonLabel,
  visibleRows,
} from "./ratingView";

const row = (place: number, nick: string, prevPlace?: number): RatingRow =>
  ({ place, id: String(place), nick, prevPlace, counted: true }) as RatingRow;
const season = (extra: Partial<Season> = {}): Season =>
  ({ id: "1", name: "", month: null, year: null, games: 0, cutoff: null, mvp: [], rows: [], hasHistory: true, ...extra }) as Season;

describe("the stored rating", () => {
  it("has the club's five leagues, each with at least one season", () => {
    expect(LEAGUES).toHaveLength(5);
    for (const league of LEAGUES) expect(league.seasons.length).toBeGreaterThan(0);
  });

  it("keeps places in order inside every table", () => {
    for (const league of LEAGUES)
      for (const s of league.seasons) {
        const places = s.rows.map((r) => r.place);
        expect(places, `${league.name} ${s.name}`).toEqual([...places].sort((a, b) => a - b));
      }
  });
});

describe("labels", () => {
  const annual = LEAGUES.find((l) => l.name.startsWith("Годовой"))!;
  const month = LEAGUES.find((l) => l.name === "Month Rating")!;

  it("names leagues in both languages", () => {
    expect(leagueLabel(annual, "ru")).toMatch(/^Годовой рейтинг \d{4}$/);
    expect(leagueLabel(annual, "en")).toMatch(/^Annual rating \d{4}$/);
    expect(leagueLabel(month, "ru")).toBe("Рейтинг месяца");
  });

  it("names seasons by month and year, and all-time tables plainly", () => {
    expect(seasonLabel(season({ month: 9, year: 2026 }), "ru")).toBe("Октябрь 2026");
    expect(seasonLabel(season({ month: 9, year: 2026 }), "en")).toBe("October 2026");
    expect(seasonLabel(season({ name: "Season 3/2025" }), "ru")).toBe("Сезон 3/2025");
    expect(seasonLabel(season(), "en")).toBe("All time");
  });
});

describe("pickSelection", () => {
  it("opens the annual rating by default", () => {
    expect(pickSelection(LEAGUES, {}).league.name).toMatch(/^Годовой/);
  });

  it("follows a valid address and ignores a broken one", () => {
    const month = LEAGUES.find((l) => l.name === "Month Rating")!;
    const older = month.seasons[1];
    expect(pickSelection(LEAGUES, { league: month.id, season: older.id }).season).toBe(older);
    expect(pickSelection(LEAGUES, { league: month.id, season: "nope" }).season).toBe(month.seasons[0]);
    expect(pickSelection(LEAGUES, { league: "nope" }).league.name).toMatch(/^Годовой/);
  });
});

describe("filterRows", () => {
  const rows = [row(1, "Walle"), row(2, "Musk💫"), row(3, "mr.Waggi")];
  it("finds nicks loosely and keeps everything for an empty query", () => {
    expect(filterRows(rows, "MUSK").map((r) => r.nick)).toEqual(["Musk💫"]);
    expect(filterRows(rows, "mr waggi").map((r) => r.nick)).toEqual(["mr.Waggi"]);
    expect(filterRows(rows, "  ")).toHaveLength(3);
    expect(filterRows(rows, "zzz")).toEqual([]);
  });
});

describe("placeChange", () => {
  it("compares with the previous place", () => {
    expect(placeChange(row(2, "a", 5), season())).toEqual({ kind: "up", by: 3 });
    expect(placeChange(row(4, "a", 1), season())).toEqual({ kind: "down", by: 3 });
    expect(placeChange(row(2, "a", 2), season())).toEqual({ kind: "same" });
    expect(placeChange(row(2, "a"), season())).toEqual({ kind: "new" });
  });

  it("shows nothing for a table that has never changed", () => {
    expect(placeChange(row(2, "a", 5), season({ hasHistory: false }))).toBe(null);
  });
});

describe("formatting", () => {
  it("writes dates in Warsaw time", () => {
    expect(formatDate("2026-11-17T23:30:00Z")).toBe("18.11.2026");
    expect(formatDate("garbage")).toBe("");
  });

  it("writes numbers without float noise", () => {
    expect(formatNumber(2.2800000001)).toBe("2.28");
    expect(formatNumber(11)).toBe("11");
    expect(formatNumber(-0.3)).toBe("-0.3");
  });
});

describe("visibleRows: a long table shows its first rows until opened", () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => row(i + 1, `nick${i + 1}`));
  const closed = { searching: false, expanded: false };

  it("cuts a long table to the first rows and counts the rest", () => {
    const all = rows(130);
    const { rows: shown, hidden } = visibleRows(all, closed);
    expect(shown).toEqual(all.slice(0, COLLAPSED_ROWS));
    expect(hidden).toBe(130 - COLLAPSED_ROWS);
  });

  it("shows every row once opened", () => {
    const all = rows(130);
    expect(visibleRows(all, { searching: false, expanded: true })).toEqual({ rows: all, hidden: 0 });
  });

  it("shows every match while searching, however many there are", () => {
    const all = rows(130);
    const matches = filterRows(all, "nick1");
    expect(matches.length).toBeGreaterThan(COLLAPSED_ROWS);
    expect(visibleRows(matches, { searching: true, expanded: false })).toEqual({ rows: matches, hidden: 0 });
  });

  it("does not cut a table that is only a few rows longer than the cut", () => {
    for (const n of [0, 5, COLLAPSED_ROWS, COLLAPSED_ROWS + 5]) expect(visibleRows(rows(n), closed).hidden).toBe(0);
    expect(visibleRows(rows(COLLAPSED_ROWS + 6), closed).hidden).toBe(6);
  });

  it("keeps the counted rows and the first rows below the cutoff in place order", () => {
    const all = rows(60).map((r, i) => ({ ...r, counted: i < 18 }));
    const { rows: shown } = visibleRows(all, closed);
    expect(shown.map((r) => r.place)).toEqual(Array.from({ length: COLLAPSED_ROWS }, (_, i) => i + 1));
    // The cutoff divider goes before the first uncounted row, which is still on screen here.
    expect(shown.find((r) => !r.counted)?.place).toBe(19);
  });
});
