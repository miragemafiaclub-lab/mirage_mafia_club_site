import type { EventKind } from "../data/schedule";
import type { Translations } from "./lang";

type ScheduleStrings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Short weekday labels, Monday first (index = weekIndex()). */
  daysShort: string[];
  /** Full weekday names, Monday first. */
  daysFull: string[];
  events: Record<EventKind, string>;
  today: string;
  tomorrow: string;
  timeTba: string;
  place: string;
  timeTbaShort: string;
  noGame: string;
  selectedGame: string;
  weekGroup: string;
  prevWeek: string;
  nextWeek: string;
  signup: string;
  signupLabel: string;
  photoAlt: string;
  caption: [string, string, string];
  /** "12 ноября" / "November 12". */
  fullDate: (date: Date) => string;
  /** Week switcher label, e.g. "10 – 16 ноября" / "November 10 – 16". */
  weekRange: (first: Date, last: Date) => string;
};

const RU_MONTHS_GENITIVE = [
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
];
// For a week that spans two months: the full names do not fit the week switcher.
const RU_MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

const EN_MONTHS = [
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
];
const EN_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ruFullDate = (date: Date) => `${date.getDate()} ${RU_MONTHS_GENITIVE[date.getMonth()]}`;
const enFullDate = (date: Date) => `${EN_MONTHS[date.getMonth()]} ${date.getDate()}`;

export const schedule: Translations<ScheduleStrings> = {
  ru: {
    eyebrow: "Расписание",
    title: "Ближайшая игра",
    subtitle: "Выбери день и запишись на игру",
    daysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    daysFull: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
    events: {
      open: "Открытый игровой вечер",
      captains: "Капитанский стол",
      newcomers: "День новичка",
    },
    today: "Сегодня",
    tomorrow: "Завтра",
    timeTba: "Время в анонсе",
    place: "Ludna 2, 5 этаж, Варшава",
    timeTbaShort: "анонс",
    noGame: "Нет игры",
    selectedGame: "Выбранная игра",
    weekGroup: "Расписание на неделю",
    prevWeek: "Предыдущая неделя",
    nextWeek: "Следующая неделя",
    signup: "Записаться",
    signupLabel: "Записаться в Telegram (откроется в новой вкладке)",
    photoAlt: "Игрок в маске за столом Mirage во время ночной фазы",
    caption: ["Те же люди.", "Разные роли.", "Всегда в хорошем настроении."],
    fullDate: ruFullDate,
    weekRange: (first, last) =>
      first.getMonth() === last.getMonth()
        ? `${first.getDate()} – ${ruFullDate(last)}`
        : `${first.getDate()} ${RU_MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${RU_MONTHS_SHORT[last.getMonth()]}`,
  },
  en: {
    eyebrow: "Schedule",
    title: "Next game",
    subtitle: "Pick a day and sign up for a game",
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    daysFull: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    events: {
      open: "Open game night",
      captains: "Captains' table",
      newcomers: "Newcomers' day",
    },
    today: "Today",
    tomorrow: "Tomorrow",
    timeTba: "Time in the announcement",
    place: "Ludna 2, 5th floor, Warsaw",
    timeTbaShort: "TBA",
    noGame: "No game",
    selectedGame: "Selected game",
    weekGroup: "Weekly schedule",
    prevWeek: "Previous week",
    nextWeek: "Next week",
    signup: "Sign up",
    signupLabel: "Sign up on Telegram (opens in a new tab)",
    photoAlt: "A masked player at a Mirage table during the night phase",
    caption: ["Same people.", "Different roles.", "Always good vibes."],
    fullDate: enFullDate,
    weekRange: (first, last) =>
      first.getMonth() === last.getMonth()
        ? `${enFullDate(first)} – ${last.getDate()}`
        : `${EN_MONTHS_SHORT[first.getMonth()]} ${first.getDate()} – ${EN_MONTHS_SHORT[last.getMonth()]} ${last.getDate()}`,
  },
};
