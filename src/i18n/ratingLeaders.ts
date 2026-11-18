import type { Translations } from "./lang";

/** The top-three podium in the /rating intro. */
export const ratingLeaders: Translations<{
  title: string;
  place: (n: number) => string;
  /** Average per game first: iMafia ranks the annual table by it, so it explains the order. */
  points: (avg: string, total: string) => string;
}> = {
  ru: {
    title: "Лидеры",
    place: (n) => `${n} место`,
    points: (avg, total) => `Ср. ${avg} · ${total} балл.`,
  },
  en: {
    title: "Leaders",
    place: (n) => `${n}${["st", "nd", "rd"][n - 1] ?? "th"} place`,
    points: (avg, total) => `Avg ${avg} · ${total} pts`,
  },
};
