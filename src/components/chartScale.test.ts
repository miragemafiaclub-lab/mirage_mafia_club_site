import { describe, expect, it } from "vitest";
import { niceScale } from "./chartScale";

describe("niceScale", () => {
  it("rounds the axis up to about three clean steps", () => {
    expect(niceScale(24.5)).toEqual({ top: 30, step: 10 });
    expect(niceScale(11.4)).toEqual({ top: 15, step: 5 });
    expect(niceScale(7)).toEqual({ top: 7.5, step: 2.5 });
  });

  it("always reaches the highest value", () => {
    for (const max of [0.3, 1, 9.9, 42, 100.4, 999]) expect(niceScale(max).top).toBeGreaterThanOrEqual(max);
  });

  it("draws an empty axis for no points", () => {
    expect(niceScale(0)).toEqual({ top: 1, step: 1 });
  });
});
