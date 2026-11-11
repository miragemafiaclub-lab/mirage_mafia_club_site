import type { TournamentFormat } from "../data/podium";
import type { Translations } from "./lang";

// Russian needs three plural forms ("1 место", "3 места", "8 мест"); English uses the first two.
export type Forms = [one: string, few: string, many: string];

export const podiumText: Translations<{
  // Month names as they read after a day number: "7 ноября", "7 November".
  monthsAfterDay: string[];
  formats: Record<TournamentFormat, string>;
  place: Forms;
  tournaments: Forms;
  players: Forms;
  and: string;
  team: string;
  inTeam: string;
  placeLabel: (place: number) => string;
  heading: string;
  collapse: string;
  showAll: (tournaments: string) => string;
  stats: { tournaments: string; medalists: string; places: string };
  eyebrow: string;
  title: string;
  lead: string;
  empty: string;
}> = {
  ru: {
    monthsAfterDay: [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ],
    formats: { single: "личный", team: "командный", series: "этап серии" },
    place: ["место", "места", "мест"],
    tournaments: ["турнир", "турнира", "турниров"],
    players: ["игрок", "игрока", "игроков"],
    and: "и",
    team: "команда",
    inTeam: "в команде",
    placeLabel: (place) => `${place} место`,
    heading: "Турниры",
    collapse: "Свернуть",
    showAll: (tournaments) => `Показать все ${tournaments}`,
    stats: { tournaments: "Турниров", medalists: "Призёров", places: "Призовых мест" },
    eyebrow: "Турниры",
    title: "Пьедестал победителей",
    lead: "Игроки Mirage, которые заняли призовые места на турнирах за последние две недели. Результаты с iMafia и MafGame, обновляются раз в две недели.",
    empty: "За эти две недели без призовых мест. Ждём следующих турниров!",
  },
  en: {
    monthsAfterDay: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    formats: { single: "individual", team: "team", series: "series stage" },
    place: ["place", "places", "places"],
    tournaments: ["tournament", "tournaments", "tournaments"],
    players: ["player", "players", "players"],
    and: "&",
    team: "team",
    inTeam: "with team",
    placeLabel: (place) => `Place ${place}`,
    heading: "Tournaments",
    collapse: "Show less",
    showAll: (tournaments) => `Show all ${tournaments}`,
    stats: { tournaments: "Tournaments", medalists: "Medalists", places: "Prize places" },
    eyebrow: "Podium",
    title: "Winners' podium",
    lead: "Mirage players who finished in the prizes at tournaments over the last two weeks. Results come from iMafia and MafGame and are updated every two weeks.",
    empty: "No prize places in these two weeks. On to the next tournaments!",
  },
};
