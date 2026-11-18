import { describe, expect, it } from "vitest";
import { buildPlayerStats, type ProfileRecord } from "./playerStats";
import type { StoredRating } from "./rating";

const row = (place: number, id: string, points: number, games: number) => [place, id, points, points / games, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, games];
const rating: StoredRating = {
  updatedAt: "2026-11-18T05:00:00Z",
  members: [],
  leagues: [
    {
      id: "140",
      name: "Годовой рейтинг IMafia 2026",
      seasons: [{ id: "536", name: "Годовой рейтинг IMafia 2026", month: null, year: null, games: 9, cutoff: null, mvp: [], nicks: { 63: "Walle", 5: "Sima" }, rows: [row(1, "5", 20, 10), row(2, "63", 15, 9)], prev: {} }],
    },
    {
      id: "106",
      name: "Month Rating",
      seasons: [
        { id: "678", name: "Октябрь", month: 9, year: 2026, games: 5, cutoff: { percent: 30, games: 3, after: 1 }, mvp: ["63"], nicks: { 63: "Walle", 5: "Sima" }, rows: [row(1, "5", 9, 5), row(2, "63", 4, 2)], prev: {} },
        { id: "639", name: "Сентябрь", month: 8, year: 2026, games: 5, cutoff: null, mvp: ["63"], nicks: { 63: "Walle" }, rows: [row(1, "63", 11, 5)], prev: {} },
        { id: "630", name: "Август", month: 7, year: 2026, games: 5, cutoff: null, mvp: ["5"], nicks: { 5: "Sima" }, rows: [row(1, "5", 8, 4)], prev: {} },
      ],
    },
  ],
};

describe("buildPlayerStats", () => {
  const stats = buildPlayerStats(rating, {}, "63");

  it("lists every table the player is in, with the table size", () => {
    expect(stats.places.map((p) => [p.leagueName, p.seasonId, p.place, p.of])).toEqual([
      ["Годовой рейтинг IMafia 2026", "536", 2, 2],
      ["Month Rating", "678", 2, 2],
      ["Month Rating", "639", 1, 1],
    ]);
  });

  it("orders monthly points oldest first and marks uncounted months", () => {
    expect(stats.monthly).toEqual([
      { year: 2026, month: 8, points: 11, place: 1, games: 5, counted: true },
      { year: 2026, month: 9, points: 4, place: 2, games: 2, counted: false },
    ]);
  });

  it("counts months as MVP, even one where the player was below the line", () => {
    expect(stats.mvpMonths).toBe(2);
    expect(buildPlayerStats(rating, {}, "5").mvpMonths).toBe(1);
  });

  it("attaches the iMafia profile when there is one", () => {
    expect(stats.profile).toBe(null);
    const profile = { winRate: 50 } as ProfileRecord;
    expect(buildPlayerStats(rating, { 63: profile }, "63").profile).toBe(profile);
  });
});
