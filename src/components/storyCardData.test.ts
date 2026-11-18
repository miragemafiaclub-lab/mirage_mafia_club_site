import { describe, expect, it } from "vitest";
import type { ClubPlayer } from "../data/playerDirectory";
import type { PlayerPlace, PlayerStats } from "../data/playerStats";
import { storyCardData } from "./storyCardData";

const player = { nick: "Walle", slug: "walle", group: "chk", photo: "/walle.jpg" } as ClubPlayer;
const place = (extra: Partial<PlayerPlace>): PlayerPlace => ({
  leagueId: "1", leagueName: "Month Rating", seasonId: "1", seasonName: "", month: null, year: null,
  place: 1, of: 10, counted: true, points: 0, avg: 0, games: 0, wins: 0, extraSum: 0, ...extra,
});
const stats = (places: PlayerPlace[], winRate: number | null = 51.1): PlayerStats =>
  ({ id: "63", places, monthly: [], mvpMonths: 0, profile: winRate === null ? null : { winRate }, updatedAt: "" }) as PlayerStats;
const annual = place({ leagueName: "Годовой рейтинг IMafia 2026", place: 34, games: 22, wins: 11 });

describe("storyCardData", () => {
  it("leads with the latest counted month", () => {
    const data = storyCardData(player, stats([annual, place({ month: 9, year: 2026, place: 4 })]), "ru");
    expect(data.place).toBe("№4");
    expect(data.placeLabel).toBe("в рейтинге клуба · Октябрь 2026");
    expect(data.stats).toEqual([
      { label: "игр", value: "22" },
      { label: "побед", value: "11" },
      { label: "винрейт", value: "51%" },
    ]);
  });

  it("falls back to the annual place when the month was not counted", () => {
    const data = storyCardData(player, stats([annual, place({ month: 9, year: 2026, place: 18, counted: false })]), "en");
    expect(data.place).toBe("№34");
    expect(data.placeLabel).toBe("in the annual rating 2026");
  });

  it("still makes a card without any stats", () => {
    const data = storyCardData(player, undefined, "ru");
    expect(data.place).toBe("");
    expect(data.stats).toEqual([]);
    expect(data.nick).toBe("Walle");
  });
});
