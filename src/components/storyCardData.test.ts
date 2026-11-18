import { describe, expect, it } from "vitest";
import type { ClubPlayer } from "../data/playerDirectory";
import type { PlayerPlace, PlayerStats } from "../data/playerStats";
import { storyCardData } from "./storyCardData";

const player = { nick: "Walle", slug: "walle", group: "chk", photo: "/walle.jpg" } as ClubPlayer;
const place = (extra: Partial<PlayerPlace>): PlayerPlace => ({
  leagueId: "1", leagueName: "Month Rating", seasonId: "1", seasonName: "", month: null, year: null,
  place: 1, of: 10, counted: true, points: 0, avg: 0, games: 0, wins: 0, extraSum: 0, donWins: 0, sheriffWins: 0, ...extra,
});
const stats = (places: PlayerPlace[], winRate: number | null = 51.1): PlayerStats =>
  ({ id: "63", places, monthly: [], mvpMonths: 0, profile: winRate === null ? null : { winRate }, updatedAt: "" }) as PlayerStats;
const annual = place({ leagueName: "Годовой рейтинг IMafia 2026", place: 34, games: 22, wins: 11, avg: 1.2 });
const october = place({ month: 9, year: 2026, place: 4, avg: 2, games: 6, wins: 4, donWins: 1, sheriffWins: 2, extraSum: 2 });

describe("storyCardData", () => {
  it("leads with the latest counted month: average, wins of games, the best role", () => {
    const data = storyCardData(player, stats([annual, october]), "ru");
    expect(data.period).toBe("Октябрь 2026");
    expect(data.headline).toBe("4 место в рейтинге месяца");
    expect(data.stats).toEqual([
      { label: "за игру", value: "2" },
      { label: "побед", value: "4/6" },
      { label: "шерифом", value: "2" },
    ]);
  });

  it("shows Don wins when they beat Sheriff wins, and extras per game when there are neither", () => {
    expect(storyCardData(player, stats([{ ...october, donWins: 3 }]), "en").stats[2]).toEqual({ label: "as Don", value: "3" });
    expect(storyCardData(player, stats([{ ...october, donWins: 0, sheriffWins: 0 }]), "ru").stats[2]).toEqual({
      label: "доп. за игру",
      value: "+0.33",
    });
  });

  it("falls back to the annual place when the month was not counted", () => {
    const data = storyCardData(player, stats([annual, { ...october, place: 18, counted: false }]), "en");
    expect(data.headline).toBe("Place 34 in the annual rating 2026");
    expect(data.period).toBe("2026");
    expect(data.stats).toEqual([
      { label: "per game", value: "1.2" },
      { label: "wins", value: "11/22" },
      { label: "win rate", value: "51%" },
    ]);
  });

  it("still makes a card without any stats", () => {
    const data = storyCardData(player, undefined, "ru");
    expect(data.headline).toBe("");
    expect(data.stats).toEqual([]);
    expect(data.nick).toBe("Walle");
  });
});
