import type { RecordId } from "../data/records";
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
  recordsTitle: string;
  /** "По месячным рейтингам с февраля 2026": where the records come from. */
  recordsLead: (since: string) => string;
  records: Record<RecordId, string>;
  /** Value of the MVP record: "2 раза". */
  times: (n: number) => string;
  /** Month names for "since …" (0 = January): "февраля". */
  monthsSince: string[];
  mvp: string;
  loading: string;
  loadFailed: string;
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
    leagueNames: { "Month Rating": "Рейтинг месяца", "IMafia Ranking": "iMafia Ranking", "Top 10 Battle": "Top 10 Battle", "For Fun": "For Fun" },
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    seasonGames: (n) => `Игр в сезоне: ${n}`,
    updated: (date) => `Обновлено ${date}`,
    source: "Источник: iMafia",
    place: "Место",
    change: "Изменение места",
    player: "Игрок",
    columns: {
      games: { short: "Игр", full: "Сыграно игр" },
      points: { short: "Бал", full: "Сумма всех баллов" },
      avg: { short: "Ср.", full: "Средний балл за игру" },
      extra: { short: "Доп.", full: "Дополнительные баллы: сумма всех доп. баллов" },
      wins: { short: "Поб", full: "Количество побед" },
      donWins: { short: "Дон", full: "Победы за роль Дона" },
      sheriffWins: { short: "Шер", full: "Победы за роль Шерифа" },
      firstKilled: { short: "ПУ", full: "Игры, в которых игрок убит в первую ночь" },
      ci: { short: "Ci", full: "Компенсационные баллы за отстрелы (Ci)" },
    },
    extraParts: { plus: "плюс", minus: "штрафы", discipline: "дисциплинарные", bestMoves: "лучший ход" },
    // Genitive after "меньше": 1, 21, 31… игры; everything else игр.
    cutoff: (games, percent) =>
      `Ниже — меньше ${games} ${games % 10 === 1 && games % 100 !== 11 ? "игры" : "игр"} (${percent}% игр сезона): вне зачёта`,
    nobody: "Никого не нашли",
    empty: "В этом сезоне пока нет игр",
    newEntry: "Новый в таблице",
    up: (n) => `Поднялся на ${n}`,
    down: (n) => `Опустился на ${n}`,
    same: "Без изменений",
    legendTitle: "Что значат колонки",
    legendArrows: "Стрелки — как изменилось место с прошлого обновления таблицы.",
    recordsTitle: "Рекорды клуба",
    recordsLead: (since) => `Лучшие результаты в месячных рейтингах клуба на iMafia с ${since}.`,
    records: {
      points: "Больше всего баллов за месяц",
      wins: "Больше всего побед за месяц",
      games: "Больше всего игр за месяц",
      extra: "Больше всего доп. баллов за месяц",
      extraPerGame: "Лучший доп. балл за игру за месяц",
      mvp: "Чаще всех MVP месяца",
    },
    times: (n) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      const word = mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "раза" : "раз";
      return `${n} ${word}`;
    },
    monthsSince: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    mvp: "MVP сезона",
    loading: "Загружаем рейтинг…",
    loadFailed: "Не удалось загрузить рейтинг. Обновите страницу.",
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
    leagueNames: { "Month Rating": "Monthly rating", "IMafia Ranking": "iMafia Ranking", "Top 10 Battle": "Top 10 Battle", "For Fun": "For Fun" },
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    seasonGames: (n) => `Games this season: ${n}`,
    updated: (date) => `Updated ${date}`,
    source: "Source: iMafia",
    place: "Place",
    change: "Change of place",
    player: "Player",
    columns: {
      games: { short: "GP", full: "Games played" },
      points: { short: "Pts", full: "Total points" },
      avg: { short: "Avg", full: "Average points per game" },
      extra: { short: "Extra", full: "Extra points: all extra points together" },
      wins: { short: "Wins", full: "Wins" },
      donWins: { short: "Don", full: "Wins as the Don" },
      sheriffWins: { short: "Sher", full: "Wins as the Sheriff" },
      firstKilled: { short: "FK", full: "Games in which the player was killed on the first night" },
      ci: { short: "Ci", full: "Compensation points for being shot" },
    },
    extraParts: { plus: "bonus", minus: "fines", discipline: "discipline", bestMoves: "best move" },
    cutoff: (games, percent) => `Below: fewer than ${games} ${games === 1 ? "game" : "games"} (${percent}% of the season's games), not counted`,
    nobody: "No one found",
    empty: "No games in this season yet",
    newEntry: "New in the table",
    up: (n) => `Up ${n}`,
    down: (n) => `Down ${n}`,
    same: "No change",
    legendTitle: "What the columns mean",
    legendArrows: "Arrows show how the place changed since the table's previous update.",
    recordsTitle: "Club records",
    recordsLead: (since) => `Best results in the club's monthly iMafia ratings since ${since}.`,
    records: {
      points: "Most points in a month",
      wins: "Most wins in a month",
      games: "Most games in a month",
      extra: "Most extra points in a month",
      extraPerGame: "Best extra points per game in a month",
      mvp: "Most times MVP of the month",
    },
    times: (n) => (n === 1 ? "once" : `${n} times`),
    monthsSince: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    mvp: "Season MVP",
    loading: "Loading the rating…",
    loadFailed: "Could not load the rating. Please reload the page.",
  },
};
