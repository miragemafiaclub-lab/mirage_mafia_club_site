import { describe, expect, it } from "vitest";
import { firstTime } from "../i18n/firstTime";
import { EVENING_ORDER, MIN_PRICE_ZL, PRICES_ZL, weeklySlots } from "./visit";

describe("first-visit facts", () => {
  it("takes weekdays of weekly evenings from the schedule", () => {
    expect(weeklySlots("open")).toEqual([
      { dayIndex: 1, time: "18:30" },
      { dayIndex: 4, time: "18:30" },
    ]);
    expect(weeklySlots("newcomers")).toEqual([{ dayIndex: 6, time: null }]);
    expect(weeklySlots("mps")).toEqual([]);
  });

  it("lists every kind of evening once, Newcomers' day first", () => {
    expect(new Set(EVENING_ORDER).size).toBe(Object.keys(PRICES_ZL).length);
    expect(EVENING_ORDER[0]).toBe("newcomers");
  });

  it("knows the club's prices", () => {
    expect(PRICES_ZL).toEqual({ newcomers: 50, open: 50, fun: 50, captains: 60, mps: 80 });
    expect(MIN_PRICE_ZL).toBe(50);
  });

  it("gives evenings outside the weekly schedule their own line in both languages", () => {
    for (const lang of ["ru", "en"] as const) {
      for (const kind of EVENING_ORDER) {
        if (!weeklySlots(kind).length) expect(firstTime[lang].evenings[kind].when).toBeTruthy();
      }
    }
  });

  it("writes weekdays naturally in each language", () => {
    expect(firstTime.ru.slots(["Вторник", "Пятница"], "18:30")).toBe("Вторник и пятница, 18:30");
    expect(firstTime.en.slots(["Tuesday", "Friday"], "18:30")).toBe("Tuesday and Friday, 18:30");
  });
});
