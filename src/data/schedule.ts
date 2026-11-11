// Weekly club schedule. Edit here: the Schedule section and its "next game" card follow it.
// Source for time, address and sign-up: the club page on mafgame.org.
// Key into the event names in src/i18n/schedule.ts (shown in the visitor's language).
export type EventKind = "open" | "captains" | "newcomers";

export type ScheduleEvent = {
  kind: EventKind;
  // Russian name, kept for reference; the site shows the translated name by `kind`.
  title: string;
  // Start time, or null when it is announced separately in Telegram.
  time: string | null;
};

export const CLUB_PLACE = { address: "Ludna 2, 5 этаж", city: "Warsaw" };
export const SIGNUP_URL = "https://t.me/mirage_mafia_club";

// Monday first, as the week is shown on the site. `day` and `name` are stable keys / Russian names;
// the visible labels come from src/i18n/schedule.ts by weekday index (weekIndex()).
export const WEEK: { day: string; name: string; event: ScheduleEvent | null }[] = [
  { day: "Mon", name: "Понедельник", event: null },
  { day: "Tue", name: "Вторник", event: { kind: "open", title: "Открытый игровой вечер", time: "18:30" } },
  { day: "Wed", name: "Среда", event: { kind: "captains", title: "Капитанский стол", time: "18:30" } },
  { day: "Thu", name: "Четверг", event: null },
  { day: "Fri", name: "Пятница", event: { kind: "open", title: "Открытый игровой вечер", time: "18:30" } },
  { day: "Sat", name: "Суббота", event: null },
  { day: "Sun", name: "Воскресенье", event: { kind: "newcomers", title: "День новичка", time: null } },
];

// 0 = Monday … 6 = Sunday.
export function weekIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function startsAt(date: Date, time: string | null) {
  const [hours, minutes] = (time ?? "23:59").split(":").map(Number);
  const start = new Date(date);
  start.setHours(hours, minutes, 0, 0);
  return start;
}

// The game on that date, if there is one and it has not started yet: the only days open for sign-up.
export function gameOn(date: Date, now: Date) {
  const entry = WEEK[weekIndex(date)];
  if (!entry.event || startsAt(date, entry.event.time) <= now) return null;
  return { date, name: entry.name, event: entry.event };
}

// The nearest game open for sign-up, looking up to a week ahead.
export function nextGame(now: Date) {
  for (let offset = 0; offset <= 7; offset++) {
    const game = gameOn(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset), now);
    if (game) return game;
  }
  return null;
}

// Monday to Sunday with dates; weekOffset 0 is the current week, 1 the next one.
export function weekDates(now: Date, weekOffset: number) {
  const monday = now.getDate() - weekIndex(now) + weekOffset * 7;
  return WEEK.map((entry, index) => ({
    ...entry,
    date: new Date(now.getFullYear(), now.getMonth(), monday + index),
  }));
}

// The club's wall-clock time (Europe/Warsaw) as a local Date, so the schedule is right in any time zone.
export function warsawNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Warsaw",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, Number(part.value)]),
  );
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}
