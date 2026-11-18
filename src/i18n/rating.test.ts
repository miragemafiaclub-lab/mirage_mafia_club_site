import { describe, expect, it } from "vitest";
import { rating } from "./rating";

describe("the cutoff line", () => {
  it("agrees the noun with the number in Russian (меньше 1 игры, 3 игр, 21 игры)", () => {
    expect(rating.ru.cutoff(1, 30)).toBe("Ниже — меньше 1 игры (30% игр сезона): вне зачёта");
    expect(rating.ru.cutoff(21, 30)).toBe("Ниже — меньше 21 игры (30% игр сезона): вне зачёта");
    expect(rating.ru.cutoff(11, 30)).toBe("Ниже — меньше 11 игр (30% игр сезона): вне зачёта");
    expect(rating.ru.cutoff(3, 30)).toBe("Ниже — меньше 3 игр (30% игр сезона): вне зачёта");
  });

  it("says 'game' for one in English", () => {
    expect(rating.en.cutoff(1, 30)).toBe("Below: fewer than 1 game (30% of the season's games), not counted");
    expect(rating.en.cutoff(3, 30)).toBe("Below: fewer than 3 games (30% of the season's games), not counted");
  });
});
