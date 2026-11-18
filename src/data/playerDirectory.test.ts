import { describe, expect, it } from "vitest";
import { slugify } from "../i18n/translit";
import { buildDirectory, CLUB_PLAYERS, findPlayer, INDEXED_PLAYERS, isPlaceholderGuest, nickKey, playerByImafiaId } from "./playerDirectory";
import { CHK_BASE, KCHK_BASE } from "./players";

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

describe("buildDirectory", () => {
  it("numbers roster nicks that land on the same slug, and gives guests their stable iMafia id", () => {
    const dir = buildDirectory([
      { nick: "Мир", group: "chk" },
      { nick: "Mir", group: "kchk" },
      { nick: "МИР", group: "guest", imafiaId: "777" },
      { nick: "???", group: "guest", imafiaId: "8" },
    ]);
    expect(dir.map((p) => p.slug)).toEqual(["mir", "mir-2", "mir-777", "player"]);
  });
});

describe("the club's directory", () => {
  it("gives every player a unique, URL-safe slug", () => {
    const slugs = CLUB_PLAYERS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("keeps every roster player first, linked to their iMafia profile", () => {
    const roster = CLUB_PLAYERS.slice(0, CHK_BASE.length + KCHK_BASE.length);
    expect(roster.map((p) => p.nick)).toEqual([...CHK_BASE, ...KCHK_BASE].map((p) => p.nick));
    const unlinked = roster.filter((p) => !p.imafiaId).map((p) => p.nick);
    expect(unlinked).toEqual([]);
    expect(findPlayer("walle")?.imafiaId).toBe("63");
  });

  it("adds every other rating player as a guest, once, without iMafia's placeholder accounts", () => {
    const guests = CLUB_PLAYERS.filter((p) => p.group === "guest");
    expect(guests.length).toBeGreaterThan(50);
    expect(guests.some((p) => isPlaceholderGuest(p.nick))).toBe(false);
    const ids = CLUB_PLAYERS.map((p) => p.imafiaId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of INDEXED_PLAYERS) {
      if (!isPlaceholderGuest(p.nick)) expect(playerByImafiaId(p.id), p.nick).toBeDefined();
    }
  });

  it("finds a player by slug", () => {
    expect(findPlayer("walle")?.nick).toBe("Walle");
    expect(findPlayer("nobody")).toBeUndefined();
  });
});

describe("helpers", () => {
  it("compares nicks loosely", () => {
    expect(nickKey("Musk💫")).toBe(nickKey("musk"));
    expect(nickKey("mr.Waggi")).toBe(nickKey("Mr Waggi"));
  });

  it("recognises iMafia's placeholder accounts", () => {
    expect(isPlaceholderGuest("Гость")).toBe(true);
    expect(isPlaceholderGuest("Гость1")).toBe(true);
    expect(isPlaceholderGuest("Гостья")).toBe(false);
  });
});
