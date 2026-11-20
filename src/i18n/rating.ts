import type { RecordId } from "../data/records";
import type { Translations } from "./lang";
import { ruPlural } from "./plural";

/**
 * Rating columns. The first eight are the table's, in order (most important first); the others are only in a
 * row's details. `short` is the header, `full` the tooltip and the legend.
 */
export type ColumnId =
  | "avg"
  | "games"
  | "wins"
  | "base"
  | "extra"
  | "extraPerGame"
  | "donWins"
  | "sheriffWins"
  | "points"
  | "firstKilled"
  | "ci";

type Column = { short: string; full: string };


const enPlural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const rating: Translations<{
  eyebrow: string;
  title: string;
  lead: string;
  tournamentsLink: string;
  leagueLabel: string;
  seasonLabel: string;
  allTime: string;
  season: (name: string) => string;
  annual: (year: string) => string;
  leagueNames: Record<string, string>;
  months: string[];
  seasonGames: (n: number) => string;
  countedFrom: (n: number) => string;
  updated: (date: string) => string;
  source: string;
  place: string;
  change: string;
  player: string;
  columns: Record<ColumnId, Column>;
  cutoff: (games: number, percent: number) => string;
  showAll: (n: number) => string;
  empty: string;
  newEntry: string;
  up: (n: number) => string;
  down: (n: number) => string;
  same: string;
  legendTitle: string;
  legendArrows: string;
  legendDetails: string;
  /** What the lion after a nick stands for. */
  member: Record<"chk" | "kchk", string>;
  legendMembers: string;
  tableTitle: string;
  rankedBy: { avg: string; points: string };
  find: {
    label: string;
    placeholder: string;
    submit: string;
    clear: string;
    found: (nick: string, place: number, counted: boolean) => string;
    notFound: (query: string) => string;
    more: string;
  };
  podium: {
    title: string;
    place: (n: number) => string;
    perGame: string;
    points: string;
    games: (n: number) => string;
    wins: (n: number) => string;
    winRate: string;
  };
  details: {
    column: string;
    toggle: (nick: string) => string;
    won: string;
    winRate: (pct: string) => string;
    rolesTitle: string;
    winsTotal: string;
    asDon: string;
    asSheriff: string;
    asOther: string;
    firstKilled: string;
    rolesNote: string;
    rolesAllTime: string;
    leader: string;
    leadOver: (nick: string) => string;
    gapTo: (place: number, nick: string) => string;
    tieWith: (place: number, nick: string) => string;
    perGame: string;
    pointsUnit: string;
    uncounted: (games: number) => string;
    threshold: (games: number) => string;
    pointsTitle: string;
    pointsTotal: string;
    base: string;
    extra: string;
    extraPlus: string;
    extraMinus: string;
    discipline: string;
    bestMoves: string;
    extraPerGame: string;
    ci: string;
    profile: string;
  };
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
    lead: "Места игроков Mirage по лигам и сезонам iMafia. Найдите себя и посмотрите, сколько не хватает до следующего места. Данные обновляются каждый день.",
    tournamentsLink: "Ближайшие турниры членов клуба",
    leagueLabel: "Лига",
    seasonLabel: "Сезон",
    allTime: "Весь период",
    season: (name) => name.replace(/^Season\b/, "Сезон"),
    annual: (year) => `Годовой рейтинг ${year}`,
    leagueNames: { "Month Rating": "Рейтинг месяца", "IMafia Ranking": "iMafia Ranking", "Top 10 Battle": "Top 10 Battle", "For Fun": "For Fun" },
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    seasonGames: (n) => `Игр в сезоне: ${n}`,
    countedFrom: (n) => `В зачёте от ${n} ${ruPlural(n, ["игры", "игр", "игр"])}`,
    updated: (date) => `Обновлено ${date}`,
    source: "Источник: iMafia",
    place: "Место",
    change: "Изменение места",
    player: "Игрок",
    columns: {
      avg: { short: "Ср.", full: "Средний балл за игру" },
      games: { short: "Игр", full: "Сыграно игр" },
      wins: { short: "Поб", full: "Количество побед" },
      base: { short: "Осн.", full: "Основные баллы: все баллы без дополнительных" },
      extra: { short: "Доп", full: "Дополнительные баллы: сумма всех доп. баллов" },
      extraPerGame: { short: "Доп/и", full: "Дополнительные баллы в среднем за игру" },
      donWins: { short: "Дон", full: "Победы за роль Дона" },
      sheriffWins: { short: "Шер", full: "Победы за роль Шерифа" },
      points: { short: "Бал", full: "Сумма всех баллов" },
      firstKilled: { short: "ПУ", full: "Игры, в которых игрок убит в первую ночь" },
      ci: { short: "Ci", full: "Компенсационные баллы за отстрелы (Ci)" },
    },
    // Genitive after "меньше": 1, 21, 31… игры; everything else игр.
    cutoff: (games, percent) =>
      `Ниже — меньше ${games} ${games % 10 === 1 && games % 100 !== 11 ? "игры" : "игр"} (${percent}% игр сезона): вне зачёта`,
    showAll: (n) => `Показать всех (${n})`,
    empty: "В этом сезоне пока нет игр",
    newEntry: "Новый в таблице",
    up: (n) => `Поднялся на ${n}`,
    down: (n) => `Опустился на ${n}`,
    same: "Без изменений",
    legendTitle: "Что значат колонки",
    legendArrows: "Стрелки — как изменилось место с прошлого обновления таблицы.",
    legendDetails: "Нажмите на строку: победы по ролям, разрыв до следующего места и все баллы игрока.",
    member: { chk: "член клуба", kchk: "кандидат в члены клуба" },
    legendMembers: "Оранжевый лев у ника — член клуба (ЧК), серый — кандидат в члены клуба (КЧК).",
    tableTitle: "Вся таблица",
    rankedBy: { avg: "Место считается по среднему баллу за игру", points: "Место считается по сумме баллов" },
    find: {
      label: "Найди себя",
      placeholder: "Ваш ник",
      submit: "Найти",
      clear: "Очистить",
      found: (nick, place, counted) => `${nick}: ${place}-е место${counted ? "" : " (вне зачёта)"}.`,
      notFound: (query) => `«${query}» нет в этой таблице. Проверьте ник или выберите другую лигу.`,
      more: "Ещё совпадения:",
    },
    podium: {
      title: "Тройка лидеров",
      place: (n) => `${n} место`,
      perGame: "за игру",
      points: "баллов",
      games: (n) => `${n} ${ruPlural(n, ["игра", "игры", "игр"])}`,
      wins: (n) => `${n} ${ruPlural(n, ["победа", "победы", "побед"])}`,
      winRate: "побед",
    },
    details: {
      column: "Подробнее",
      toggle: (nick) => `Подробнее: ${nick}`,
      won: "побед",
      winRate: (pct) => `Выиграно ${pct}% игр`,
      rolesTitle: "Победы по ролям",
      winsTotal: "Победы всего",
      asDon: "Доном",
      asSheriff: "Шерифом",
      asOther: "Мирным или мафией",
      firstKilled: "Первым убит",
      rolesNote: "iMafia считает по сезону только победы Доном и Шерифом; остальные — мирным или мафией, без разбивки.",
      rolesAllTime: "Все четыре роли за всю историю — в профиле →",
      leader: "Лидер таблицы.",
      leadOver: (nick) => `Отрыв от 2-го места (${nick}):`,
      gapTo: (place, nick) => `До ${place}-го места (${nick}):`,
      tieWith: (place, nick) => `Столько же, сколько у ${place}-го места (${nick})`,
      perGame: "за игру",
      pointsUnit: "балл.",
      uncounted: (games) => `Сыграйте ещё ${games} ${ruPlural(games, ["игру", "игры", "игр"])}, чтобы попасть в зачёт.`,
      threshold: (games) => `Сейчас порог — ${games} ${ruPlural(games, ["игра", "игры", "игр"])}; он растёт вместе с числом игр сезона.`,
      pointsTitle: "Баллы",
      pointsTotal: "Всего",
      base: "Основные",
      extra: "Доп. баллы",
      extraPlus: "плюс",
      extraMinus: "штрафы",
      discipline: "дисциплинарные",
      bestMoves: "лучший ход",
      extraPerGame: "Доп. за игру",
      ci: "Ci (компенсация)",
      profile: "Профиль игрока",
    },
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
    times: (n) => `${n} ${ruPlural(n, ["раз", "раза", "раз"])}`,
    monthsSince: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    mvp: "MVP сезона",
    loading: "Загружаем рейтинг…",
    loadFailed: "Не удалось загрузить рейтинг. Обновите страницу.",
  },
  en: {
    eyebrow: "Rating",
    title: "Club rating",
    lead: "Mirage players' places by iMafia league and season. Find yourself and see how much you need for the next place. Updated every day.",
    tournamentsLink: "Upcoming tournaments of club members",
    leagueLabel: "League",
    seasonLabel: "Season",
    allTime: "All time",
    season: (name) => name,
    annual: (year) => `Annual rating ${year}`,
    leagueNames: { "Month Rating": "Monthly rating", "IMafia Ranking": "iMafia Ranking", "Top 10 Battle": "Top 10 Battle", "For Fun": "For Fun" },
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    seasonGames: (n) => `Games this season: ${n}`,
    countedFrom: (n) => `Counted from ${n} ${enPlural(n, "game", "games")}`,
    updated: (date) => `Updated ${date}`,
    source: "Source: iMafia",
    place: "Place",
    change: "Change of place",
    player: "Player",
    columns: {
      avg: { short: "Avg", full: "Average points per game" },
      games: { short: "GP", full: "Games played" },
      wins: { short: "Wins", full: "Wins" },
      base: { short: "Base", full: "Base points: all points without the extra points" },
      extra: { short: "Extra", full: "Extra points: all extra points together" },
      extraPerGame: { short: "Ex/G", full: "Extra points per game on average" },
      donWins: { short: "Don", full: "Wins as the Don" },
      sheriffWins: { short: "Sher", full: "Wins as the Sheriff" },
      points: { short: "Pts", full: "Total points" },
      firstKilled: { short: "FK", full: "Games in which the player was killed on the first night" },
      ci: { short: "Ci", full: "Compensation points for being shot" },
    },
    cutoff: (games, percent) => `Below: fewer than ${games} ${games === 1 ? "game" : "games"} (${percent}% of the season's games), not counted`,
    showAll: (n) => `Show all (${n})`,
    empty: "No games in this season yet",
    newEntry: "New in the table",
    up: (n) => `Up ${n}`,
    down: (n) => `Down ${n}`,
    same: "No change",
    legendTitle: "What the columns mean",
    legendArrows: "Arrows show how the place changed since the table's previous update.",
    legendDetails: "Open a row for wins by role, the gap to the next place and all of the player's points.",
    member: { chk: "club member", kchk: "membership candidate" },
    legendMembers: "An orange lion after a nick marks a club member, a grey one a membership candidate.",
    tableTitle: "Full table",
    rankedBy: { avg: "Places follow the average points per game", points: "Places follow the total points" },
    find: {
      label: "Find yourself",
      placeholder: "Your nick",
      submit: "Find",
      clear: "Clear",
      found: (nick, place, counted) => `${nick}: place ${place}${counted ? "" : " (not counted)"}.`,
      notFound: (query) => `"${query}" is not in this table. Check the nick or pick another league.`,
      more: "Other matches:",
    },
    podium: {
      title: "Top three",
      place: (n) => `${n}${["st", "nd", "rd"][n - 1] ?? "th"} place`,
      perGame: "per game",
      points: "points",
      games: (n) => `${n} ${enPlural(n, "game", "games")}`,
      wins: (n) => `${n} ${enPlural(n, "win", "wins")}`,
      winRate: "won",
    },
    details: {
      column: "Details",
      toggle: (nick) => `Details: ${nick}`,
      won: "won",
      winRate: (pct) => `Won ${pct}% of games`,
      rolesTitle: "Wins by role",
      winsTotal: "All wins",
      asDon: "As the Don",
      asSheriff: "As the Sheriff",
      asOther: "As a civilian or mafia",
      firstKilled: "Killed first",
      rolesNote: "Per season iMafia only counts wins as the Don and as the Sheriff; the rest are as a civilian or mafia, not split further.",
      rolesAllTime: "All four roles over the whole history are in the profile →",
      leader: "Leads the table.",
      leadOver: (nick) => `Ahead of 2nd place (${nick}) by`,
      gapTo: (place, nick) => `To place ${place} (${nick}):`,
      tieWith: (place, nick) => `Level with place ${place} (${nick})`,
      perGame: "per game",
      pointsUnit: "pts",
      uncounted: (games) => `Play ${games} more ${enPlural(games, "game", "games")} to be counted.`,
      threshold: (games) => `The line is ${games} ${enPlural(games, "game", "games")} now; it rises with the season's games.`,
      pointsTitle: "Points",
      pointsTotal: "Total",
      base: "Base",
      extra: "Extra points",
      extraPlus: "bonus",
      extraMinus: "fines",
      discipline: "discipline",
      bestMoves: "best move",
      extraPerGame: "Extra per game",
      ci: "Ci (compensation)",
      profile: "Player profile",
    },
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
