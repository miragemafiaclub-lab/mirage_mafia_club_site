import { describe, expect, it } from "vitest";
import { profile } from "./profile";

describe("profile texts", () => {
  it("uses the right Russian plural for a tournament's player count", () => {
    const players = profile.ru.players;
    expect(players(21)).toBe("21 участник");
    expect(players(22)).toBe("22 участника");
    expect(players(44)).toBe("44 участника");
    expect(players(12)).toBe("12 участников");
    expect(players(25)).toBe("25 участников");
    expect(players(111)).toBe("111 участников");
  });
});
