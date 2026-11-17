import { describe, expect, it } from "vitest";
import { slugify } from "../i18n/translit";
import { buildDirectory, CLUB_PLAYERS, findPlayer } from "./playerDirectory";

const player = (nick: string) => ({ nick, name: "", rank: "C", joinedAt: "01.01.2024" });

describe("slugify", () => {
  it("turns nicks into Latin addresses", () => {
    expect(slugify("Логика")).toBe("logika");
    expect(slugify("Walle")).toBe("walle");
    expect(slugify("Mr. Waggi")).toBe("mr-waggi");
    expect(slugify("Січень!")).toBe("sichen");
    expect(slugify("Шахматист")).toBe("shakhmatist");
    expect(slugify("!!!")).toBe("");
  });
});

describe("player directory", () => {
  it("gives every club player a unique, non-empty slug", () => {
    const slugs = CLUB_PLAYERS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("numbers nicks that land on the same slug, in roster order", () => {
    const dir = buildDirectory([
      ["chk", [player("Мир"), player("Mir")]],
      ["kchk", [player("МИР"), player("???")]],
    ]);
    expect(dir.map((p) => p.slug)).toEqual(["mir", "mir-2", "mir-3", "player"]);
    expect(dir.map((p) => p.group)).toEqual(["chk", "chk", "kchk", "kchk"]);
  });

  it("finds a player by slug", () => {
    expect(findPlayer("walle")?.nick).toBe("Walle");
    expect(findPlayer("nobody")).toBeUndefined();
  });
});
