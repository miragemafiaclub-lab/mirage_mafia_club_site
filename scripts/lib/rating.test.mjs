import { describe, expect, it } from "vitest";
import { mergeSeason, monthKey, newWinners, ROW_FIELDS } from "./rating.mjs";

const row = (place, id, nick, points = 10) =>
  Object.fromEntries([...ROW_FIELDS.map((f) => [f, 0]), ["place", place], ["id", id], ["nick", nick], ["points", points]]);
const season = (rows, extra = {}) => ({ id: "678", name: "Октябрь", month: 9, year: 2026, games: 5, mvp: [], rows, ...extra });

describe("mergeSeason", () => {
  it("packs rows compactly and keeps nicks aside", () => {
    const s = mergeSeason(season([row(1, "63", "Walle", 12)]), undefined);
    expect(s.rows).toEqual([[1, "63", 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);
    expect(s.nicks).toEqual({ 63: "Walle" });
    expect(s.prev).toEqual({});
  });

  it("remembers the old places when the table changes", () => {
    const before = mergeSeason(season([row(1, "a", "A"), row(2, "b", "B")]), undefined);
    const after = mergeSeason(season([row(1, "b", "B"), row(2, "a", "A")]), before);
    expect(after.prev).toEqual({ a: 1, b: 2 });
  });

  it("keeps the arrows of the last change on a day with no change", () => {
    const first = mergeSeason(season([row(1, "a", "A"), row(2, "b", "B")]), undefined);
    const changed = mergeSeason(season([row(1, "b", "B"), row(2, "a", "A")]), first);
    const sameDay = mergeSeason(season([row(1, "b", "B"), row(2, "a", "A")]), changed);
    expect(sameDay.prev).toEqual({ a: 1, b: 2 });
  });
});

describe("newWinners", () => {
  const oct = mergeSeason(season([row(1, "5068", "Immortal"), row(2, "63", "Walle")]), undefined);
  const nov = mergeSeason(season([row(1, "63", "Walle")], { id: "700", month: 10 }), undefined);

  it("takes first place of finished months only", () => {
    const now = new Date(2026, 10, 1, 7); // 1 November 2026, the morning sync
    expect(newWinners([nov, oct], {}, now)).toEqual([{ key: "2026-10", id: "5068", nick: "Immortal" }]);
  });

  it("never replaces a month that is already recorded", () => {
    const now = new Date(2026, 11, 1);
    expect(newWinners([nov, oct], { "2026-10": { nick: "Someone" } }, now)).toEqual([
      { key: "2026-11", id: "63", nick: "Walle" },
    ]);
  });

  it("formats month keys", () => {
    expect(monthKey({ year: 2026, month: 2 })).toBe("2026-03");
  });
});
