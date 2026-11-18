import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assignYears, monthOf, parseLeagues, parseMembers, parseMvp, parseProfile, parseRatingTable, stripTags } from "./imafia.mjs";

const parseRatingRows = (html) => parseRatingTable(html).rows;

const fixture = (name) => readFileSync(new URL(`../__fixtures__/${name}`, import.meta.url), "utf8");
const club = fixture("club.html");
const month = JSON.parse(fixture("rating-month.json"));
const noSeason = JSON.parse(fixture("rating-no-season.json"));

describe("parseLeagues", () => {
  const leagues = parseLeagues(club);

  it("finds all five leagues of the club", () => {
    expect(leagues.map((l) => l.name)).toEqual([
      "Годовой рейтинг IMafia 2026",
      "Top 10 Battle",
      "For Fun",
      "Month Rating",
      "IMafia Ranking",
    ]);
  });

  it("puts each season under its league, newest first, with the month for monthly ones", () => {
    const monthly = leagues.find((l) => l.name === "Month Rating").seasons;
    expect(monthly[0]).toEqual({ id: "678", name: "Рейтинг открытых вечеров. Октябрь", month: 9 });
    expect(monthly.at(-1).month).toBe(2);
    expect(leagues.find((l) => l.name === "IMafia Ranking").seasons.map((s) => s.name)).toEqual([
      "Season 3/2025",
      "Season 2/2024",
      "Season 1/2023",
    ]);
  });

  it("gives a league without seasons one all-time table", () => {
    expect(leagues.find((l) => l.name === "Top 10 Battle").seasons).toEqual([{ id: "", name: "", month: null }]);
  });

  it("fails loudly when the page has no rating filter", () => {
    expect(() => parseLeagues("<html></html>")).toThrow(/no leagues/);
  });
});

describe("parseRatingRows", () => {
  it("reads every column of a monthly table", () => {
    const rows = parseRatingRows(month.items_html);
    expect(rows).toHaveLength(20);
    expect(rows[0]).toEqual({
      place: 1, id: "5068", nick: "Immortal", points: 11.4, avg: 2.28,
      extraSum: 3.4, extraPlus: 3.4, extraMinus: 0, discipline: 0, bestMoves: 0,
      ci: 0, wins: 3, donWins: 1, sheriffWins: 0, firstKilled: 0, games: 5,
    });
    expect(rows[1]).toMatchObject({ nick: "Січень!", extraMinus: 0, bestMoves: 0.2 });
  });

  it("reads negative numbers and an all-time table", () => {
    const rows = parseRatingRows(noSeason.items_html);
    expect(rows.length).toBeGreaterThan(10);
    expect(rows.every((r, i) => r.place === i + 1 || r.place <= i + 1)).toBe(true);
    expect(parseRatingRows(JSON.parse(fixture("rating-no-season.json")).items_html)[0].nick).toBe("FTRK");
  });

  it("records the minimum-games line and where it falls", () => {
    expect(parseRatingTable(month.items_html).cutoff).toEqual({ percent: 30, games: 3, after: 17 });
    expect(parseRatingTable("<tr><td>1</td></tr>").cutoff).toBe(null);
  });

  it("skips rows without a player link", () => {
    expect(parseRatingRows("<tr><td>1</td><td>nobody</td></tr>")).toEqual([]);
  });
});

describe("other parsers", () => {
  it("lists MVP nominees", () => {
    expect(parseMvp(month.nominations)).toEqual(["5068", "4994", "63"]);
    expect(parseMvp({ mvp: { 9: { id: 9, points_judge: "1" }, 10: { id: 10, points_judge: "2" } } })).toEqual(["10", "9"]);
    expect(parseMvp(undefined)).toEqual([]);
  });

  it("reads club members with their iMafia ids", () => {
    const members = parseMembers(club);
    expect(members[0]).toEqual({ id: "63", nick: "Walle" });
    expect(new Set(members.map((m) => m.id)).size).toBe(members.length);
  });

  it("reads avatar and rank from a profile", () => {
    const profile = parseProfile(fixture("profile.html"));
    expect(profile.photoPath).toMatch(/^\/uploads\/users\/middle\//);
    expect(profile.rank).toBe("C");
  });

  it("decodes entities and drops comments", () => {
    expect(stripTags("<b>A&amp;B</b><!-- x --> &quot;c&quot;")).toBe('A&B "c"');
  });

  it("knows monthly season names", () => {
    expect(monthOf("Рейтинг открытых вечеров. Март")).toBe(2);
    expect(monthOf("Season 3/2025")).toBe(null);
  });
});

describe("assignYears", () => {
  const m = (month) => ({ month });

  it("steps back a year when months wrap around", () => {
    const now = new Date(2027, 1, 10); // February 2027
    const seasons = assignYears([m(1), m(0), m(11), m(10), { month: null }], now);
    expect(seasons.map((s) => s.year)).toEqual([2027, 2027, 2026, 2026, null]);
  });

  it("starts last year when the newest month is still ahead in the calendar", () => {
    expect(assignYears([m(11)], new Date(2027, 0, 5))[0].year).toBe(2026);
  });
});
