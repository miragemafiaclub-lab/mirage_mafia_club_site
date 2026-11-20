import { describe, expect, it } from "vitest";
import { unpackRating, type RatingRow, type Season, type StoredRating } from "./rating";
import ratingJson from "./rating.json";

const LEAGUES = unpackRating(ratingJson as StoredRating);
import {
  basePoints,
  COLLAPSED_ROWS,
  extraPerGame,
  findRows,
  formatDate,
  formatNumber,
  formatSigned,
  isHiddenRow,
  leagueLabel,
  monthTop,
  otherRoleWins,
  orderLeagues,
  pickSelection,
  placeChange,
  podiumRows,
  rankMetric,
  seasonLabel,
  standing,
  visibleRows,
  winRate,
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
  it("opens the newest month by default", () => {
    const { league, season } = pickSelection(LEAGUES, {});
    expect(league.name).toBe("Month Rating");
    expect(season).toBe(league.seasons[0]);
  });

  it("follows a valid address and ignores a broken one", () => {
    const month = LEAGUES.find((l) => l.name === "Month Rating")!;
    const older = month.seasons[1];
    expect(pickSelection(LEAGUES, { league: month.id, season: older.id }).season).toBe(older);
    expect(pickSelection(LEAGUES, { league: month.id, season: "nope" }).season).toBe(month.seasons[0]);
    expect(pickSelection(LEAGUES, { league: "nope" }).league.name).toBe("Month Rating");
  });

  it("falls back to the annual rating without a monthly table", () => {
    expect(pickSelection(LEAGUES.filter((l) => l.name !== "Month Rating"), {}).league.name).toMatch(/^Годовой/);
  });
});

describe("orderLeagues", () => {
  it("puts the month first, the annual rating second, the rest in their order", () => {
    const names = orderLeagues(LEAGUES).map((l) => l.name);
    expect(names.slice(0, 2)).toEqual(["Month Rating", expect.stringMatching(/^Годовой/)]);
    expect(names.slice(2)).toEqual(LEAGUES.map((l) => l.name).filter((n) => n !== "Month Rating" && !/^Годовой/.test(n)));
  });
});

describe("findRows: find yourself", () => {
  const rows = [row(1, "Walle"), row(2, "Musk💫"), row(3, "mr.Waggi"), row(4, "Wall"), row(5, "Big Walle")];

  it("finds nicks loosely, and nothing for an empty query", () => {
    expect(findRows(rows, "MUSK").map((r) => r.nick)).toEqual(["Musk💫"]);
    expect(findRows(rows, "mr waggi").map((r) => r.nick)).toEqual(["mr.Waggi"]);
    expect(findRows(rows, "  ")).toEqual([]);
    expect(findRows(rows, "zzz")).toEqual([]);
  });

  it("puts the whole nick first, then nicks starting with the query, then the rest, each by place", () => {
    expect(findRows(rows, "wall").map((r) => r.nick)).toEqual(["Wall", "Walle", "Big Walle"]);
    expect(findRows(rows, "walle").map((r) => r.nick)).toEqual(["Walle", "Big Walle"]);
  });

  it("finds players behind 'Show all' too, and says they are hidden", () => {
    const long = Array.from({ length: 60 }, (_, i) => row(i + 1, `nick${i + 1}`));
    const [found] = findRows(long, "nick42");
    expect(found.place).toBe(42);
    expect(isHiddenRow(long, found)).toBe(true);
    expect(isHiddenRow(long, long[3])).toBe(false);
  });
});

describe("derived columns", () => {
  const r = { points: 12, extraSum: 2, games: 6, wins: 4, donWins: 1, sheriffWins: 2 } as RatingRow;

  it("splits points into base and extras", () => {
    expect(basePoints(r)).toBe(10);
    expect(basePoints({ ...r, points: 24.9, extraSum: 2.9 })).toBe(22);
    expect(basePoints({ ...r, points: 37.2, extraSum: -27.8 })).toBe(65);
  });

  it("counts extras per game, and nothing without games", () => {
    expect(extraPerGame(r)).toBeCloseTo(0.3333);
    expect(extraPerGame({ ...r, games: 0 })).toBe(0);
  });

  it("leaves wins as a civilian or mafia once Don and Sheriff wins are taken out", () => {
    expect(otherRoleWins(r)).toBe(1);
    expect(otherRoleWins({ ...r, wins: 3 })).toBe(0);
  });

  it("works out the win rate", () => {
    expect(winRate(r)).toBeCloseTo(66.67, 1);
    expect(winRate({ wins: 0, games: 0 })).toBe(0);
  });
});

describe("standing: the gap to the next place", () => {
  const r = (place: number, nick: string, avg: number, points: number, counted = true, games = 5) =>
    ({ place, id: nick, nick, avg, points, counted, games }) as RatingRow;
  const byAvg = season({
    cutoff: { percent: 30, games: 3 },
    rows: [r(1, "Immortal", 2.28, 11.4), r(2, "Січень!", 2.2, 11), r(3, "Никки", 2.08, 10.4), r(4, "Walle", 2, 12), r(5, "Late", 2, 4, false, 2)],
  });

  it("knows what a table is sorted by", () => {
    expect(rankMetric(byAvg)).toBe("avg");
    const byPoints = season({ rows: [r(1, "a", 1.5, 30), r(2, "b", 2, 20)] });
    expect(rankMetric(byPoints)).toBe("points");
    expect(rankMetric(season({ rows: [r(1, "a", 1.5, 10), r(2, "b", 2, 20)] }))).toBe(null);
    expect(rankMetric(season())).toBe(null);
  });

  it("gives the gap to the player one place higher, in the table's metric", () => {
    expect(standing(byAvg.rows[3], byAvg)).toMatchObject({ kind: "gap", metric: "avg", gap: 0.08, target: { nick: "Никки" } });
    const byPoints = season({ rows: [r(1, "a", 1.5, 30), r(2, "b", 2, 20.5)] });
    expect(standing(byPoints.rows[1], byPoints)).toMatchObject({ kind: "gap", metric: "points", gap: 9.5 });
  });

  it("gives the leader's lead over the second", () => {
    expect(standing(byAvg.rows[0], byAvg)).toMatchObject({ kind: "leader", lead: 0.08, next: { nick: "Січень!" } });
  });

  it("tells an uncounted player how many games are missing", () => {
    expect(standing(byAvg.rows[4], byAvg)).toEqual({ kind: "uncounted", games: 1, threshold: 3 });
  });

  it("says nothing where the order is not a single metric", () => {
    const mixed = season({ rows: [r(1, "a", 1.5, 10), r(2, "b", 2, 20)] });
    expect(standing(mixed.rows[1], mixed)).toBe(null);
  });

  it("puts the counted top three on the podium", () => {
    expect(podiumRows(byAvg).map((x) => x.nick)).toEqual(["Immortal", "Січень!", "Никки"]);
    expect(podiumRows(season({ rows: [r(1, "a", 1, 1, false)] }))).toEqual([]);
  });
});

describe("monthTop: the home page's best players of the month", () => {
  it("takes the latest month with counted players, at most five of them", () => {
    const top = monthTop(LEAGUES)!;
    const month = LEAGUES.find((l) => l.name === "Month Rating")!;
    const latest = month.seasons.find((s) => s.rows.some((x) => x.counted))!;
    expect(top.seasonId).toBe(latest.id);
    expect(top.leagueId).toBe(month.id);
    expect(top.rows.length).toBeLessThanOrEqual(5);
    const real = (x: { counted: boolean; nick: string }) => x.counted && !/^(гость|guest)\s*\d*$/i.test(x.nick.trim());
    expect(top.rows.map((x) => x.place)).toEqual(latest.rows.filter(real).slice(0, 5).map((x) => x.place));
  });

  it("skips a new month nobody is counted in yet", () => {
    const month = LEAGUES.find((l) => l.name === "Month Rating")!;
    const fresh = { ...month.seasons[0], id: "new", month: 10, rows: month.seasons[0].rows.map((x) => ({ ...x, counted: false })) };
    const top = monthTop([{ ...month, seasons: [fresh, ...month.seasons] }])!;
    expect(top.seasonId).toBe(month.seasons[0].id);
  });

  it("leaves out iMafia's shared guest accounts, keeping the others' places", () => {
    const month = LEAGUES.find((l) => l.name === "Month Rating")!;
    const latest = month.seasons.find((s) => s.rows.some((x) => x.counted))!;
    const rows = latest.rows.map((x, i) => (i === 1 ? { ...x, nick: "Гость1" } : x));
    const top = monthTop([{ ...month, seasons: [{ ...latest, rows }] }])!;
    expect(top.rows.some((x) => x.nick === "Гость1")).toBe(false);
    expect(top.rows.map((x) => x.place)).toEqual(rows.filter((x) => x.counted && !/^(гость|guest)\s*\d*$/i.test(x.nick.trim())).slice(0, 5).map((x) => x.place));
  });

  it("is empty without a monthly league", () => {
    expect(monthTop([])).toBe(null);
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

  it("signs extras with a real minus", () => {
    expect(formatSigned(2)).toBe("+2");
    expect(formatSigned(-0.3)).toBe("−0.3");
    expect(formatSigned(0)).toBe("0");
    expect(formatSigned(1 / 3, 2)).toBe("+0.33");
    expect(formatSigned(-0.001, 2)).toBe("0.00");
  });
});

describe("visibleRows: a long table shows its first rows until opened", () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => row(i + 1, `nick${i + 1}`));
  const closed = { expanded: false };

  it("shows fifteen rows", () => {
    expect(COLLAPSED_ROWS).toBe(15);
  });

  it("cuts a long table to the first rows and counts the rest", () => {
    const all = rows(130);
    const { rows: shown, hidden } = visibleRows(all, closed);
    expect(shown).toEqual(all.slice(0, COLLAPSED_ROWS));
    expect(hidden).toBe(130 - COLLAPSED_ROWS);
  });

  it("shows every row once opened", () => {
    const all = rows(130);
    expect(visibleRows(all, { expanded: true })).toEqual({ rows: all, hidden: 0 });
  });

  it("does not cut a table that is only a row or two longer than the cut", () => {
    for (const n of [0, 5, COLLAPSED_ROWS, COLLAPSED_ROWS + 2]) expect(visibleRows(rows(n), closed).hidden).toBe(0);
    expect(visibleRows(rows(20), closed).hidden).toBe(5);
  });

  it("keeps the counted rows and the first rows below the cutoff in place order", () => {
    const all = rows(60).map((r, i) => ({ ...r, counted: i < 12 }));
    const { rows: shown } = visibleRows(all, closed);
    expect(shown.map((r) => r.place)).toEqual(Array.from({ length: COLLAPSED_ROWS }, (_, i) => i + 1));
    // The cutoff divider goes before the first uncounted row, which is still on screen here.
    expect(shown.find((r) => !r.counted)?.place).toBe(13);
  });
});
