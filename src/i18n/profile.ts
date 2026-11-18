import type { Translations } from "./lang";

export const profile: Translations<{
  inClub: string;
  annualPlace: string;
  monthPlace: (month: string) => string;
  of: (n: number) => string;
  games: string;
  wins: string;
  winRate: string;
  mvp: string;
  rolesTitle: string;
  rolesNote: string;
  roles: { don: string; mafia: string; civilian: string; sheriff: string };
  roleLine: (wins: number, games: number) => string;
  chartTitle: string;
  chartTip: (month: string, points: string, place: number, counted: boolean) => string;
  placesTitle: string;
  league: string;
  season: string;
  place: string;
  points: string;
  prizesTitle: string;
  prizesNote: (tournaments: number) => string;
  prizesNone: string;
  awardsTitle: string;
  firstBlood: string;
  noStats: string;
  loading: string;
  loadFailed: string;
  medal: (place: number) => string;
  players: (n: number) => string;
  updated: (date: string) => string;
  showAll: (n: number) => string;
  showFewer: string;
  story: {
    button: string;
    title: string;
    preparing: string;
    failed: string;
    download: string;
    share: string;
    close: string;
    monthPlace: (place: number) => string;
    annualPlace: (place: number, year: string) => string;
    perGame: string;
    wins: string;
    asDon: string;
    asSheriff: string;
    extraPerGame: string;
    winRate: string;
  };
  card: {
    title: string;
    label: (month: string) => string;
    avg: string;
    place: (n: number) => string;
    of: (n: number) => string;
    uncounted: string;
    games: string;
    wins: string;
    winRate: string;
    extraPerGame: string;
    don: string;
    sheriff: string;
    open: string;
  };
  compareWith: string;
}> = {
  ru: {
    inClub: "В клубе",
    annualPlace: "Годовой рейтинг",
    monthPlace: (month) => `Рейтинг · ${month}`,
    of: (n) => `из ${n}`,
    games: "Игр в году",
    wins: "Побед в году",
    winRate: "Винрейт на iMafia",
    mvp: "MVP месяца",
    rolesTitle: "Роли",
    rolesNote: "По всем играм игрока на iMafia, не только клубным.",
    roles: { don: "Дон", mafia: "Мафия", civilian: "Мирный", sheriff: "Шериф" },
    roleLine: (wins, games) => `${wins} из ${games}`,
    chartTitle: "Баллы в рейтинге месяца",
    chartTip: (month, points, place, counted) => `${month}: ${points} б., ${place} место${counted ? "" : " (вне зачёта)"}`,
    placesTitle: "Все рейтинги клуба",
    league: "Лига",
    season: "Сезон",
    place: "Место",
    points: "Баллы",
    prizesTitle: "Призовые места на турнирах",
    prizesNote: (n) => `Всего турниров на iMafia: ${n}.`,
    prizesNone: "Призовых мест на турнирах iMafia пока нет.",
    awardsTitle: "Награды iMafia",
    firstBlood: "Первый убитый",
    noStats: "Подробная статистика появится в ближайшие дни.",
    loading: "Загружаем статистику…",
    loadFailed: "Не удалось загрузить статистику. Обновите страницу.",
    medal: (place) => `${place} место`,
    players: (n) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return `${n} участник`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} участника`;
      return `${n} участников`;
    },
    updated: (date) => `Данные iMafia на ${date}`,
    showAll: (n) => `Показать все (${n})`,
    showFewer: "Свернуть",
    story: {
      button: "Карточка для сторис",
      title: "Карточка для сторис",
      preparing: "Рисуем карточку…",
      failed: "Не получилось нарисовать карточку. Попробуйте ещё раз.",
      download: "Скачать",
      share: "Поделиться",
      close: "Закрыть",
      monthPlace: (place) => `${place} место в рейтинге месяца`,
      annualPlace: (place, year) => `${place} место в годовом рейтинге ${year}`,
      perGame: "за игру",
      wins: "побед",
      asDon: "доном",
      asSheriff: "шерифом",
      extraPerGame: "доп. за игру",
      winRate: "винрейт",
    },
    card: {
      title: "Карточка месяца",
      label: (month) => `Рейтинг месяца · ${month}`,
      avg: "Ср.",
      place: (n) => `${n} место`,
      of: (n) => `из ${n}`,
      uncounted: "вне зачёта",
      games: "Игр",
      wins: "Побед",
      winRate: "Винрейт",
      extraPerGame: "Доп/игра",
      don: "Дон",
      sheriff: "Шериф",
      open: "Открыть таблицу месяца",
    },
    compareWith: "Сравнить с другим игроком",
  },
  en: {
    inClub: "In the club",
    annualPlace: "Annual rating",
    monthPlace: (month) => `Rating · ${month}`,
    of: (n) => `of ${n}`,
    games: "Games this year",
    wins: "Wins this year",
    winRate: "iMafia win rate",
    mvp: "MVP of the month",
    rolesTitle: "Roles",
    rolesNote: "All the player's games on iMafia, not only the club's.",
    roles: { don: "Don", mafia: "Mafia", civilian: "Civilian", sheriff: "Sheriff" },
    roleLine: (wins, games) => `${wins} of ${games}`,
    chartTitle: "Points in the monthly rating",
    chartTip: (month, points, place, counted) => `${month}: ${points} pts, place ${place}${counted ? "" : " (not counted)"}`,
    placesTitle: "All club ratings",
    league: "League",
    season: "Season",
    place: "Place",
    points: "Points",
    prizesTitle: "Tournament prize places",
    prizesNote: (n) => `Tournaments on iMafia: ${n}.`,
    prizesNone: "No iMafia tournament prize places yet.",
    awardsTitle: "iMafia awards",
    firstBlood: "First killed",
    noStats: "Detailed stats will appear in the next few days.",
    loading: "Loading stats…",
    loadFailed: "Could not load the stats. Please reload the page.",
    medal: (place) => `Place ${place}`,
    players: (n) => `${n} players`,
    updated: (date) => `iMafia data as of ${date}`,
    showAll: (n) => `Show all (${n})`,
    showFewer: "Show fewer",
    story: {
      button: "Story card",
      title: "Story card",
      preparing: "Drawing the card…",
      failed: "Could not draw the card. Please try again.",
      download: "Download",
      share: "Share",
      close: "Close",
      monthPlace: (place) => `Place ${place} in the monthly rating`,
      annualPlace: (place, year) => `Place ${place} in the annual rating ${year}`,
      perGame: "per game",
      wins: "wins",
      asDon: "as Don",
      asSheriff: "as Sheriff",
      extraPerGame: "extra per game",
      winRate: "win rate",
    },
    card: {
      title: "Card of the month",
      label: (month) => `Monthly rating · ${month}`,
      avg: "Avg",
      place: (n) => `Place ${n}`,
      of: (n) => `of ${n}`,
      uncounted: "not counted",
      games: "Games",
      wins: "Wins",
      winRate: "Win rate",
      extraPerGame: "Ex/game",
      don: "Don",
      sheriff: "Sheriff",
      open: "Open the month's table",
    },
    compareWith: "Compare with another player",
  },
};
