import { describe, expect, it } from "vitest";
import { gameOn, nextGame } from "./schedule";

// 2026-11-17 is a Tuesday; the captains' table is on Wednesdays, by invitation.
const at = (day: number, hour: number) => new Date(2026, 10, day, hour, 0);

describe("next game", () => {
  it("skips the invite-only captains' table and offers the next open evening", () => {
    // Tuesday evening, after the open night has started: next is Friday, not Wednesday.
    expect(nextGame(at(17, 20))?.date.getDate()).toBe(20);
    expect(nextGame(at(17, 20))?.event.kind).toBe("open");
  });

  it("still shows the captains' table as a game on its day", () => {
    expect(gameOn(new Date(2026, 10, 18), at(18, 10))?.event).toMatchObject({ kind: "captains", inviteOnly: true });
  });
});
