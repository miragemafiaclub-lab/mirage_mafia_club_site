import { describe, expect, it } from "vitest";
import { betterSide, COMPARE_ROWS, suggestedPairs } from "./compare";
import { playerByImafiaId } from "./playerDirectory";
import type { RatingRow, Season } from "./rating";
import type { PlayerStats } from "./playerStats";

const stats = (annualPlace: number, games: number, winRate: number | null): PlayerStats => ({
  id: "x",
  places: [{ leagueId: "140", leagueName: "Годовой рейтинг IMafia 2026", seasonId: "536", seasonName: "", month: null, year: null, place: annualPlace, of: 100, counted: true, points: 0, avg: 0, games, wins: 1, extraSum: 0 }],
  monthly: [],
  mvpMonths: 0,
  profile: winRate === null ? null : ({ winRate, roles: { don: { wins: 1, games: 2 }, mafia: { wins: 0, games: 0 }, civilian: { wins: 0, games: 0 }, sheriff: { wins: 0, games: 0 } }, prizes: [], cups: 0 } as unknown as PlayerStats["profile"]),
  updatedAt: "",
});
const row = (id: string) => COMPARE_ROWS.find((r) => r.id === id)!;

describe("betterSide", () => {
  it("prefers the lower place and the higher count", () => {
    expect(betterSide(row("annual"), stats(3, 10, 50), stats(7, 20, 40))).toBe("a");
    expect(betterSide(row("games"), stats(3, 10, 50), stats(7, 20, 40))).toBe("b");
    expect(betterSide(row("winRate"), stats(3, 10, 50), stats(7, 20, 40))).toBe("a");
  });

  it("calls no winner on a tie or a missing value", () => {
    expect(betterSide(row("games"), stats(1, 10, 50), stats(2, 10, 50))).toBe(null);
    expect(betterSide(row("winRate"), stats(1, 10, null), stats(2, 10, 50))).toBe(null);
    expect(betterSide(row("mafia"), stats(1, 10, 50), stats(2, 10, 50))).toBe(null);
  });

  it("reads role win rates from the profile", () => {
    expect(row("don").value(stats(1, 1, 50))).toBe(50);
  });
});

describe("suggestedPairs", () => {
  const rowFor = (place: number, id: string) => ({ place, id, nick: id, counted: true }) as unknown as RatingRow;
  const season = (rows: RatingRow[], month: number | null = null): Season => ({
    id: "s",
    name: "",
    month,
    year: month === null ? null : 2026,
    games: 1,
    cutoff: null,
    mvp: [],
    rows,
    hasHistory: false,
  });
  const leagues = [
    { id: "140", name: "Годовой рейтинг IMafia 2026", seasons: [season([rowFor(1, "1243"), rowFor(2, "2768"), rowFor(3, "143")])] },
    { id: "106", name: "Month Rating", seasons: [season([rowFor(1, "5068"), rowFor(2, "143")], 9)] },
  ];
  const slug = (id: string) => playerByImafiaId(id)!.slug;
  const won = (id: string) => ({ profileUrl: `https://imafia.org/u/${id}` });

  it("offers the year's and the month's top two and the two leaders", () => {
    // The last two players of the month are the month's top two here: offered once.
    expect(suggestedPairs(leagues, { "2026-09": won("143"), "2026-10": won("5068") })).toEqual([
      { kind: "annual", a: slug("1243"), b: slug("2768") },
      { kind: "month", a: slug("5068"), b: slug("143") },
      { kind: "leaders", a: slug("1243"), b: slug("5068") },
    ]);
  });

  it("adds the last two different players of the month", () => {
    const winners = { "2026-08": won("143"), "2026-09": won("2768"), "2026-10": won("2768") };
    expect(suggestedPairs(leagues, winners).at(-1)).toEqual({ kind: "winners", a: slug("2768"), b: slug("143") });
  });
});
