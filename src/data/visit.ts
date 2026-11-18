// Facts for the "First time?" page. Edit here: the page reads prices and links from this file
// and the weekdays from WEEK in schedule.ts.

import { WEEK, type EventKind } from "./schedule";

/** Kinds of club evenings: the weekly ones from the schedule plus ones announced separately. */
export type EveningKind = EventKind | "fun" | "mps";

/** Price per evening, in złoty. The bot always shows the exact price when you sign up. */
export const PRICES_ZL: Record<EveningKind, number> = {
  newcomers: 50,
  open: 50,
  fun: 50,
  captains: 60,
  mps: 80,
};

/** Order on the page: the best choice for a first visit first. */
export const EVENING_ORDER: EveningKind[] = ["newcomers", "open", "captains", "fun", "mps"];

/** The cheapest evening, for "from 50 zł". */
export const MIN_PRICE_ZL = Math.min(...Object.values(PRICES_ZL));

export const MAFIA_SCHOOL_URL = "https://learnmafia.com";
export const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Ludna+2%2C+00-406+Warszawa";
export const IMAFIA_URL = "https://imafia.org";

/** Weekdays (0 = Monday) and start time of a weekly evening; empty for evenings outside the weekly schedule. */
export function weeklySlots(kind: EveningKind): { dayIndex: number; time: string | null; usualTime?: string }[] {
  return WEEK.flatMap((entry, dayIndex) =>
    entry.event?.kind === kind
      ? [{ dayIndex, time: entry.event.time, ...(entry.event.usualTime && { usualTime: entry.event.usualTime }) }]
      : [],
  );
}
