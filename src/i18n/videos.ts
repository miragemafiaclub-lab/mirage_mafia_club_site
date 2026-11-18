import type { Translations } from "./lang";

const RU_MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Day and month in Warsaw time, so the prerender and every visitor agree. */
function warsawParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: Number(get("day")), month: Number(get("month")) - 1, year: Number(get("year")), time: `${get("hour")}:${get("minute")}` };
}

export const videos: Translations<{
  eyebrow: string;
  title: string;
  lead: string;
  channel: string;
  channelLabel: string;
  live: string;
  liveWatch: string;
  upcoming: (iso: string) => string;
  date: (iso: string) => string;
  watchLabel: (title: string) => string;
  /** Header badge on the YouTube icon. */
  liveBadge: string;
}> = {
  ru: {
    eyebrow: "YouTube",
    title: "Смотрите наши игры",
    lead: "Трансляции и записи игр клуба: можно посмотреть, как играют опытные игроки, до первого визита.",
    channel: "Все видео на YouTube",
    channelLabel: "YouTube-канал клуба (откроется в новой вкладке)",
    live: "Сейчас в эфире",
    liveWatch: "Смотреть трансляцию",
    upcoming: (iso) => {
      const d = warsawParts(iso);
      return `Трансляция ${d.day} ${RU_MONTHS[d.month]} в ${d.time}`;
    },
    date: (iso) => {
      const d = warsawParts(iso);
      return `${d.day} ${RU_MONTHS[d.month]} ${d.year}`;
    },
    watchLabel: (title) => `${title} — смотреть на YouTube (откроется в новой вкладке)`,
    liveBadge: "Сейчас в эфире на YouTube (откроется в новой вкладке)",
  },
  en: {
    eyebrow: "YouTube",
    title: "Watch our games",
    lead: "Streams and recordings of club games: see how experienced players play before your first visit.",
    channel: "All videos on YouTube",
    channelLabel: "The club's YouTube channel (opens in a new tab)",
    live: "Live now",
    liveWatch: "Watch the stream",
    upcoming: (iso) => {
      const d = warsawParts(iso);
      return `Stream on ${EN_MONTHS[d.month]} ${d.day} at ${d.time}`;
    },
    date: (iso) => {
      const d = warsawParts(iso);
      return `${EN_MONTHS[d.month]} ${d.day}, ${d.year}`;
    },
    watchLabel: (title) => `${title} — watch on YouTube (opens in a new tab)`,
    liveBadge: "Live now on YouTube (opens in a new tab)",
  },
};
