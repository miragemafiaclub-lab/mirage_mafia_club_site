import { describe, expect, it } from "vitest";
import { candidatesFrom, isPlaceholderGuest, MAX_AGE_DAYS, pickProfiles, profileRecord } from "./profiles.mjs";

const NOW = Date.parse("2026-11-18T05:00:00Z");
const daysAgo = (n) => new Date(NOW - n * 86_400_000).toISOString();

describe("candidatesFrom", () => {
  const rating = {
    members: [{ id: "63", nick: "Walle" }],
    leagues: [
      { seasons: [{ nicks: { 63: "Walle", 9: "Гость", 5: "Sima" }, rows: [[1, "63", ...Array(12).fill(0), 10], [2, "9", ...Array(12).fill(0), 1], [3, "5", ...Array(12).fill(0), 4]] }] },
      { seasons: [{ nicks: { 5: "Sima" }, rows: [[1, "5", ...Array(12).fill(0), 6]] }] },
    ],
  };

  it("sums games across tables, marks members, drops placeholder accounts", () => {
    expect(candidatesFrom(rating)).toEqual([
      { id: "63", nick: "Walle", games: 10, member: true },
      { id: "5", nick: "Sima", games: 10, member: false },
    ]);
    expect(isPlaceholderGuest("Гость12")).toBe(true);
  });
});

describe("pickProfiles", () => {
  const c = (id, games, member = false) => ({ id, nick: id, games, member });

  it("fetches new profiles first, members before guests, busiest first", () => {
    const picked = pickProfiles([c("g1", 5), c("m1", 1, true), c("g2", 50)], {}, NOW, 10);
    expect(picked).toEqual(["m1", "g2", "g1"]);
  });

  it("then players who played since the last fetch, then stale ones; fresh ones wait", () => {
    const stored = {
      played: { fetchedAt: daysAgo(1), gamesSeen: 3 },
      stale: { fetchedAt: daysAgo(MAX_AGE_DAYS + 1), gamesSeen: 7 },
      fresh: { fetchedAt: daysAgo(2), gamesSeen: 9 },
    };
    const picked = pickProfiles([c("fresh", 9), c("stale", 7), c("played", 4), c("new", 1)], stored, NOW, 10);
    expect(picked).toEqual(["new", "played", "stale"]);
  });

  it("never exceeds the daily limit", () => {
    const many = Array.from({ length: 60 }, (_, i) => c(String(i), i));
    expect(pickProfiles(many, {}, NOW)).toHaveLength(25);
  });
});

describe("profileRecord", () => {
  it("keeps only prize places from the tournament list", () => {
    const stats = {
      rank: "A", winRate: 50, roles: {}, firstBlood: 10, cups: 2, awards: [],
      tournaments: [{ place: 1 }, { place: 4 }, { place: 3 }, { place: null }],
    };
    const record = profileRecord(stats, { games: 12, now: NOW, avatar: null });
    expect(record.prizes).toEqual([{ place: 1 }, { place: 3 }]);
    expect(record.tournaments).toBe(4);
    expect(record.gamesSeen).toBe(12);
    expect(record.fetchedAt).toBe("2026-11-18T05:00:00.000Z");
  });
});
