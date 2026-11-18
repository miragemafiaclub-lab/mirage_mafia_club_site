import { describe, expect, it } from "vitest";
import { awardName } from "./awards";

describe("awardName", () => {
  it("translates iMafia's Ukrainian award names", () => {
    expect(awardName("Чемпіон iMafia", "ru")).toEqual({ text: "Чемпион iMafia" });
    expect(awardName("Чемпіон iMafia", "en")).toEqual({ text: "iMafia Champion" });
    expect(awardName("Прорив року", "ru")).toEqual({ text: "Прорыв года" });
    expect(awardName("Кращий дон", "en")).toEqual({ text: "Best Don" });
  });

  it("shows an unknown award as iMafia wrote it, marked as Ukrainian", () => {
    expect(awardName("Кращий шериф", "ru")).toEqual({ text: "Кращий шериф", lang: "uk" });
    expect(awardName("Кращий шериф", "en")).toEqual({ text: "Кращий шериф", lang: "uk" });
  });
});
