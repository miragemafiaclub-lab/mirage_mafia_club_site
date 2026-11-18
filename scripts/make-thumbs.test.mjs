import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { rosterPhotos } from "./make-thumbs.mjs";

describe("rosterPhotos", () => {
  it("matches nicks to their photo files", () => {
    const ts = `import aPhoto from "../assets/players/a.jpg";
import bPhoto from "../assets/players/b.jpeg";
export const CHK_BASE: RosterPlayer[] = [
  {
    nick: "Alpha",
    photo: aPhoto,
  },
  {
    nick: "NoPhoto",
    name: "x",
  },
  {
    nick: "Beta",
    photo: bPhoto,
  },
];`;
    expect([...rosterPhotos(ts)]).toEqual([
      ["Alpha", "a.jpg"],
      ["Beta", "b.jpeg"],
    ]);
  });

  it("finds a photo for every roster player that has one in players.ts", () => {
    const ts = readFileSync(new URL("../src/data/players.ts", import.meta.url), "utf8");
    const withPhoto = (ts.match(/^\s+photo: \w+,$/gm) ?? []).length;
    expect(rosterPhotos(ts).size).toBe(withPhoto);
  });
});
