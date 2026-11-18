import type { Translations } from "./lang";

/** The top-three podium in the /rating intro. */
export const ratingLeaders: Translations<{
  title: string;
  place: (n: number) => string;
  points: (n: string) => string;
}> = {
  ru: {
    title: "Лидеры",
    place: (n) => `${n} место`,
    points: (n) => `${n} балл.`,
  },
  en: {
    title: "Leaders",
    place: (n) => `${n}${["st", "nd", "rd"][n - 1] ?? "th"} place`,
    points: (n) => `${n} pts`,
  },
};
