import type { Translations } from "./lang";

/** Rating columns, in table order. `short` is the header, `full` the tooltip and the legend. */
export type ColumnId = "games" | "points" | "avg" | "extra" | "wins" | "donWins" | "sheriffWins" | "firstKilled" | "ci";

type Column = { short: string; full: string };

export const rating: Translations<{
  eyebrow: string;
  title: string;
  lead: string;
  leagueLabel: string;
  seasonLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  allTime: string;
  season: (name: string) => string;
  annual: (year: string) => string;
  leagueNames: Record<string, string>;
  months: string[];
  seasonGames: (n: number) => string;
  updated: (date: string) => string;
  source: string;
  place: string;
  change: string;
  player: string;
  columns: Record<ColumnId, Column>;
  extraParts: { plus: string; minus: string; discipline: string; bestMoves: string };
  cutoff: (games: number, percent: number) => string;
  nobody: string;
  empty: string;
  newEntry: string;
  up: (n: number) => string;
  down: (n: number) => string;
  same: string;
  legendTitle: string;
  legendArrows: string;
  mvp: string;
}> = {
  ru: {
    eyebrow: "Рейтинг",
    title: "Рейтинг клуба",
    lead: "Места игроков Mirage по лигам и сезонам iMafia. Данные обновляются каждый день.",
    leagueLabel: "Лига",
    seasonLabel: "Сезон",
    searchLabel: "Поиск по нику",
    searchPlaceholder: "Найти игрока",
    allTime: "Весь период",
    season: (name) => name.replace(/^Season\b/, "Сезон"),
    annual: (year) => `Годовой рейтинг ${year}`,
    leagueNames: { "Month Rating": "Рейтинг месяца", "IMafia Ranking": "IMafia Ranking", "Top 10 Battle": "Top 10 Battle", "For Fun": "For Fun" },
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    seasonGames: (n) => `Игр в сезоне: ${n}`,
    updated: (date) => `Обновлено ${date}`,
    source: "Источник: iMafia",
    place: "Место",
    change: "Изменение места",
    player: "Игрок",
    columns: {
      games: { short: "И", full: "Сыграно игр" },
      points: { short: "Б", full: "Сумма всех баллов" },
      avg: { short: "Б/И", full: "Средний балл за игру" },
      extra: { short: "Доп.", full: "Дополнительные баллы: сумма всех доп. баллов" },
      wins: { short: "П", full: "Количество побед" },
      donWins: { short: "Д", full: "Победы за роль Дона" },
      sheriffWins: { short: "Ш", full: "Победы за роль Шерифа" },
      firstKilled: { short: "В", full: "Игры, в которых игрок убит в первую ночь" },
      ci: { short: "Ci", full: "Компенсационные баллы за отстрелы" },
    },
    extraParts: { plus: "плюс", minus: "штрафы", discipline: "дисциплинарные", bestMoves: "лучший ход" },
    cutoff: (games, percent) => `Ниже — меньше ${games} игр (${percent}% игр сезона): вне зачёта`,
    nobody: "Никого не нашли",
    empty: "В этом сезоне пока нет игр",
    newEntry: "Новый в таблице",
    up: (n) => `Поднялся на ${n}`,
    down: (n) => `Опустился на ${n}`,
    same: "Без изменений",
    legendTitle: "Что значат колонки",
    legendArrows: "Стрелки — как изменилось место с прошлого обновления таблицы.",
    mvp: "MVP сезона",
  },
  en: {
    eyebrow: "Rating",
    title: "Club rating",
    lead: "Mirage players' places by iMafia league and season. Updated every day.",
    leagueLabel: "League",
    seasonLabel: "Season",
    searchLabel: "Search by nick",
    searchPlaceholder: "Find a player",
    allTime: "All time",
    season: (name) => name,
    annual: (year) => `Annual rating ${year}`,
    leagueNames: { "Month Rating": "Monthly rating", "IMafia Ranking": "IMafia Ranking", "Top 10 Battle": "Top 10 Battle", "For Fun": "For Fun" },
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    seasonGames: (n) => `Games this season: ${n}`,
    updated: (date) => `Updated ${date}`,
    source: "Source: iMafia",
    place: "Place",
    change: "Change of place",
    player: "Player",
    columns: {
      games: { short: "G", full: "Games played" },
      points: { short: "P", full: "Total points" },
      avg: { short: "P/G", full: "Average points per game" },
      extra: { short: "Extra", full: "Extra points: all extra points together" },
      wins: { short: "W", full: "Wins" },
      donWins: { short: "D", full: "Wins as the Don" },
      sheriffWins: { short: "S", full: "Wins as the Sheriff" },
      firstKilled: { short: "K1", full: "Games in which the player was killed on the first night" },
      ci: { short: "Ci", full: "Compensation points for being shot" },
    },
    extraParts: { plus: "bonus", minus: "fines", discipline: "discipline", bestMoves: "best move" },
    cutoff: (games, percent) => `Below: fewer than ${games} games (${percent}% of the season's games), not counted`,
    nobody: "No one found",
    empty: "No games in this season yet",
    newEntry: "New in the table",
    up: (n) => `Up ${n}`,
    down: (n) => `Down ${n}`,
    same: "No change",
    legendTitle: "What the columns mean",
    legendArrows: "Arrows show how the place changed since the table's previous update.",
    mvp: "Season MVP",
  },
};
