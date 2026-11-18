import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseClubMemberIds, parseRoster } from "./sources.mjs";
import {
  classify,
  countryOf,
  imafiaPlace,
  ourImafiaPlayers,
  ourMafgamePlayers,
  parseImafiaList,
  parseImafiaTournament,
  parseMafgameList,
  parseMafgameParticipants,
  sortTournaments,
} from "./tournaments.mjs";

// Trimmed copies of real pages, saved 2026-11-18.
const fixture = (name) => readFileSync(new URL(`../__fixtures__/tournaments/${name}`, import.meta.url), "utf8");

describe("parseImafiaList", () => {
  const items = parseImafiaList(fixture("imafia-list.html"));

  it("reads id, start date, title and the list's location with its region", () => {
    expect(items).toEqual([
      { id: "1982", start: "2026-11-17", title: "IMafia Pro League Online 2026 5th Semi-final", location: "Online", region: "Swipeal" },
      { id: "1465", start: "2026-11-21", title: "HLG 2026", location: "Warsaw", region: "Європа" },
      { id: "1897", start: "2026-11-20", title: "Командный Чемпионат Израиля 2026", location: "Ramat-Gan, Israel", region: "Європа" },
      { id: "2001", start: "2026-11-28", title: expect.any(String), location: "Кременчук, вул.…", region: "" },
    ]);
  });

  it("returns nothing for a page without cards", () => {
    expect(parseImafiaList("<html><body>Maintenance</body></html>")).toEqual([]);
  });
});

describe("parseImafiaTournament", () => {
  const page = parseImafiaTournament(fixture("imafia-tournament.html"));

  it("reads the title, the full location and both dates", () => {
    expect(page).toMatchObject({ title: "IMafia Pro League EU 2026", location: "Краков", start: "2026-11-28", end: "2026-11-29" });
  });

  it("lists confirmed players and skips the rejected ones", () => {
    expect(page.participants).toEqual([
      { id: "1233", nick: "Космічна", status: "confirmed" },
      { id: "90", nick: "Комар", status: "confirmed" },
      { id: "1407", nick: "Кукла", status: "confirmed" },
    ]);
  });

  it("fails loudly when the page has no tournament block (markup changed)", () => {
    expect(() => parseImafiaTournament("<html></html>")).toThrow(/info block/);
  });
});

describe("parseMafgameList", () => {
  const { items, lastPage } = parseMafgameList(fixture("mafgame-list.html"));

  it("reads planned tournaments with city, country and the online flag", () => {
    expect(lastPage).toBe(5);
    expect(items.find((t) => t.id === 642)).toEqual({
      id: 642,
      title: "No mercy",
      start: "2026-11-28",
      city: "Krakow",
      country: "Poland",
      online: false,
      cancelled: false,
    });
  });

  it("marks tournaments the organiser renamed to «ОТМЕНА …» as cancelled", () => {
    expect(items.find((t) => t.id === 643).cancelled).toBe(true);
  });

  it("fails on a page without Inertia data", () => {
    expect(() => parseMafgameList("<html></html>")).toThrow(/page data/);
  });
});

describe("parseMafgameParticipants", () => {
  const page = parseMafgameParticipants(fixture("mafgame-participants.html"));

  it("reads the length of the tournament and the confirmed players", () => {
    expect(page).toMatchObject({ start: "2026-11-21", days: 2, online: false, cancelled: false });
    expect(page.players[0]).toEqual({ userId: 1495, nick: "TOPS", name: "Eugeniu", clubId: 4, status: "confirmed" });
  });

  it("adds open applications when the page has them, skipping rejected ones", () => {
    const html = `<div data-page="${JSON.stringify({
      props: {
        tournament: { start_date: "2026-12-05", days: 1, online: 1, status: "approved" },
        players: [],
        applications: [
          { status: "pending", user: { id: 7, nickname: "Мёд", display_name: "Анна", club_id: 62 } },
          { status: "rejected", user: { id: 8, nickname: "X", display_name: "Y", club_id: 1 } },
        ],
      },
    }).replace(/"/g, "&quot;")}"></div>`;
    expect(parseMafgameParticipants(html)).toMatchObject({
      online: true,
      players: [{ userId: 7, nick: "Мёд", name: "Анна", clubId: 62, status: "applied" }],
    });
  });
});

describe("where a tournament is", () => {
  it("finds the country from a city in any language, or from a country name in the text", () => {
    expect(countryOf("Краков")).toBe("Poland");
    expect(countryOf("Warsaw")).toBe("Poland");
    expect(countryOf("Відень")).toBe("Austria");
    expect(countryOf("Bamberg, Germany")).toBe("Germany");
    expect(countryOf("Ramat-Gan, Israel")).toBe("Israel");
    expect(countryOf("Mirage Mafia Club, Ludna 2")).toBe("Poland");
    expect(countryOf("Republic of Moldova")).toBe("Republic of Moldova");
    expect(countryOf("Górski Raj")).toBe("Poland");
    expect(countryOf("Chicago")).toBeNull();
  });

  it("splits online, Europe and the rest", () => {
    expect(classify({ online: true, country: "Poland" })).toBe("online");
    expect(classify({ online: false, country: "Poland" })).toBe("europe");
    expect(classify({ online: false, country: "Ukraine" })).toBe("europe");
    expect(classify({ online: false, country: "Israel" })).toBe("other");
    expect(classify({ online: false, country: "Republic of Türkiye" })).toBe("other");
    expect(classify({ online: false, country: null })).toBe("other");
  });

  it("treats iMafia's Swipeal region as online and Україна as a country", () => {
    expect(imafiaPlace("Online", "Swipeal")).toEqual({ online: true, country: null, city: "" });
    expect(imafiaPlace("Кременчук, вул. Соборна", "")).toEqual({ online: false, country: "Ukraine", city: "Кременчук" });
    expect(imafiaPlace("Somewhere", "Україна")).toEqual({ online: false, country: "Ukraine", city: "Somewhere" });
    // iMafia files Israel under Європа: the country decides, not the region.
    expect(classify(imafiaPlace("Ramat-Gan, Israel", "Європа"))).toBe("other");
    // Unknown place in Europe: no country, so «Все» only.
    expect(classify(imafiaPlace("Tampa, FL", "Європа"))).toBe("other");
  });
});

describe("who of ours plays", () => {
  const roster = [
    { nick: "Мёд", name: "Анна Иванова", group: "ЧК", imafiaId: "911" },
    { nick: "Комар", name: "Олег Петров", group: "ЧК", imafiaId: "90" },
  ];

  it("matches iMafia participants by id", () => {
    expect(ourImafiaPlayers([{ id: "90", nick: "Комар", status: "confirmed" }, { id: "5", nick: "Мёд", status: "confirmed" }], roster)).toEqual([
      { nick: "Комар", imafiaId: "90", status: "confirmed" },
    ]);
  });

  it("matches MafGame players by nick plus our club or the first name", () => {
    const players = [
      { nick: "Мед", name: "Someone", clubId: 62, status: "confirmed" },
      { nick: "Комар", name: "Иван", clubId: 3, status: "confirmed" },
      { nick: "комар", name: "Олег", clubId: 3, status: "applied" },
    ];
    expect(ourMafgamePlayers(players, roster, 62)).toEqual([
      { nick: "Мёд", imafiaId: "911", status: "confirmed" },
      { nick: "Комар", imafiaId: "90", status: "applied" },
    ]);
  });
});

describe("shared helpers", () => {
  it("reads ЧК and КЧК from players.ts", () => {
    const source = `export const CHK_BASE = [\n  {\n    nick: "A",\n    name: "Ann B",\n  },\n];\nexport const KCHK_BASE = [\n  {\n    nick: "C",\n    name: "",\n  },\n];\n`;
    expect(parseRoster(source)).toEqual([
      { nick: "A", name: "Ann B", group: "ЧК" },
      { nick: "C", name: "", group: "КЧК" },
    ]);
  });

  it("reads member ids from the club page", () => {
    expect(parseClubMemberIds('<a href="/u/90" class="x"><span>Комар ● ЧК</span></a><a href="/u/1">Guest</a>')).toEqual(new Map([["Комар", "90"]]));
  });

  it("sorts by start, then end, source and title; players by nick", () => {
    const t = (id, start, end, source, title) => ({ id, start, end, source, title, players: [{ nick: "b" }, { nick: "a" }] });
    const sorted = sortTournaments([t("3", "2026-12-01", "2026-12-01", "iMafia", "B"), t("2", "2026-11-20", "2026-11-22", "MafGame", "A"), t("1", "2026-11-20", "2026-11-21", "MafGame", "Z")]);
    expect(sorted.map((x) => x.id)).toEqual(["1", "2", "3"]);
    expect(sorted[0].players.map((p) => p.nick)).toEqual(["a", "b"]);
  });
});
