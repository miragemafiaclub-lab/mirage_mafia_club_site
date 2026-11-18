import { describe, expect, it } from "vitest";
import { betterSide, COMPARE_ROWS } from "./compare";
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
