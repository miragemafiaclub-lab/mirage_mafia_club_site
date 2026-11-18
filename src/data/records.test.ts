import { describe, expect, it } from "vitest";
import type { League, RatingRow, Season } from "./rating";
import { clubRecords, recordsSince } from "./records";

const row = (id: string, fields: Partial<RatingRow> = {}): RatingRow => ({
  place: 1,
  id,
  nick: `nick${id}`,
  points: 0,
  avg: 0,
  extraSum: 0,
  extraPlus: 0,
  extraMinus: 0,
  discipline: 0,
  bestMoves: 0,
  ci: 0,
  wins: 0,
  donWins: 0,
  sheriffWins: 0,
  firstKilled: 0,
  games: 0,
  counted: true,
  ...fields,
});

const season = (month: number | null, rows: RatingRow[], mvp: string[] = []): Season => ({
  id: `s${month}`,
  name: "",
  month,
  year: month === null ? null : 2026,
  games: 0,
  cutoff: null,
  mvp,
  rows,
  hasHistory: false,
});

const leagues = (...seasons: Season[]): League[] => [{ id: "106", name: "Month Rating", seasons }];
const byId = (records: ReturnType<typeof clubRecords>) => Object.fromEntries(records.map((r) => [r.id, r]));

describe("club records", () => {
  it("finds the best single month for each record, and when it happened", () => {
    const records = byId(
      clubRecords(
        leagues(
          season(7, [row("1", { games: 20, points: 30.5, wins: 12, extraSum: 4 }), row("2", { games: 8, extraSum: 3.2 })]),
          season(8, [row("2", { games: 25, points: 28, wins: 14, extraSum: 5 })]),
        ),
      ),
    );
    expect(records.games).toEqual({ id: "games", value: 25, holders: [{ id: "2", nick: "nick2", month: 8, year: 2026 }] });
    expect(records.points.holders[0]).toMatchObject({ id: "1", month: 7 });
    expect(records.points.value).toBe(30.5);
    expect(records.wins.value).toBe(14);
    expect(records.extra.value).toBe(5);
    // 3.2 / 8 = 0.4 beats 4 / 20 = 0.2 and 5 / 25 = 0.2.
    expect(records.extraPerGame).toMatchObject({ value: 0.4, holders: [{ id: "2", month: 7 }] });
  });

  it("ignores annual and all-time tables", () => {
    const records = byId(clubRecords(leagues(season(null, [row("1", { games: 300 })]), season(8, [row("2", { games: 10 })]))));
    expect(records.games.value).toBe(10);
  });

  it("does not count players below the too-few-games line for extra points per game", () => {
    const records = byId(
      clubRecords(leagues(season(8, [row("1", { games: 1, extraSum: 2, counted: false }), row("2", { games: 10, extraSum: 3 })]))),
    );
    expect(records.extraPerGame).toMatchObject({ value: 0.3, holders: [{ id: "2" }] });
  });

  it("lists everyone who shares a record", () => {
    const records = byId(clubRecords(leagues(season(7, [row("1", { wins: 9 })]), season(8, [row("2", { wins: 9 })]))));
    expect(records.wins.holders.map((h) => h.id)).toEqual(["1", "2"]);
  });

  it("counts who was MVP of the month most often", () => {
    const records = byId(
      clubRecords(
        leagues(
          season(6, [row("1"), row("2")], ["1", "2"]),
          season(7, [row("1"), row("2")], ["1"]),
          season(8, [row("2")], ["2"]),
          season(9, [row("2")], ["2"]),
          season(10, [row("3")], ["3"]),
        ),
      ),
    );
    expect(records.mvp).toEqual({
      id: "mvp",
      value: 2,
      holders: [
        { id: "1", nick: "nick1", month: null, year: null },
        { id: "2", nick: "nick2", month: null, year: null },
      ],
    });
  });

  it("leaves out records nobody holds yet", () => {
    expect(clubRecords(leagues(season(8, [row("1")])))).toEqual([]);
  });

  it("says from which month the records are counted", () => {
    expect(recordsSince(leagues(season(null, []), season(8, []), season(2, [])))).toEqual({ month: 2, year: 2026 });
    expect(recordsSince(leagues(season(null, [])))).toBeNull();
  });
});
