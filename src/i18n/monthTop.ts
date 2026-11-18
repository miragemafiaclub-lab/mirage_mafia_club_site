import type { Translations } from "./lang";
import { ruPlural } from "./plural";

/** The home page's "best players of the month" block. */
export const monthTop: Translations<{
  eyebrow: (month: string) => string;
  /** `month` is the month's name as it follows "of": "октября", "October". */
  title: (month: string) => string;
  rankedByAvg: string;
  rankedByPoints: string;
  counted: (games: number) => string;
  gamesWins: (games: number, wins: number) => string;
  perGame: string;
  points: string;
  place: (n: number) => string;
  find: string;
  all: string;
  listLabel: (month: string) => string;
  /** 0 = January: "Октябрь" for the eyebrow, "октября" for the title. */
  months: string[];
  monthsOf: string[];
}> = {
  ru: {
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    monthsOf: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    eyebrow: (month) => `Рейтинг месяца · ${month}`,
    title: (month) => `Лучшие игроки ${month}`,
    rankedByAvg: "Место считается по среднему баллу за игру.",
    rankedByPoints: "Место считается по сумме баллов.",
    counted: (games) => `В зачёте те, кто сыграл за месяц от ${games} ${ruPlural(games, ["игры", "игр", "игр"])}.`,
    gamesWins: (games, wins) =>
      `${games} ${ruPlural(games, ["игра", "игры", "игр"])} · ${wins} ${ruPlural(wins, ["победа", "победы", "побед"])}`,
    perGame: "за игру",
    points: "баллов",
    place: (n) => `${n} место`,
    find: "Найти своё место",
    all: "Весь рейтинг",
    listLabel: (month) => `Пятёрка лучших, ${month}`,
  },
  en: {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsOf: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    eyebrow: (month) => `Monthly rating · ${month}`,
    title: (month) => `Best players of ${month}`,
    rankedByAvg: "Places follow the average points per game.",
    rankedByPoints: "Places follow the total points.",
    counted: (games) => `Counted: players with at least ${games} ${games === 1 ? "game" : "games"} that month.`,
    gamesWins: (games, wins) => `${games} ${games === 1 ? "game" : "games"} · ${wins} ${wins === 1 ? "win" : "wins"}`,
    perGame: "per game",
    points: "points",
    place: (n) => `${n}${["st", "nd", "rd"][n - 1] ?? "th"} place`,
    find: "Find your place",
    all: "Full rating",
    listLabel: (month) => `Top five, ${month}`,
  },
};
