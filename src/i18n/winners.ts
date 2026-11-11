import type { Translations } from "./lang";

export const winnersText: Translations<{
  months: string[];
  eyebrow: string;
  titleLines: [string, string];
  lead: string;
  allWinners: string;
  stats: { monthly: [string, string]; wins: [string, string]; players: [string, string]; years: [string, string] };
  badge: string;
  soon: string;
  photoAlt: (nick: string) => string;
  archivePhotoAlt: (nick: string, month: string) => string;
  profile: (nick: string) => string;
  prev: string;
  next: string;
  selectMonth: string;
  archiveTitle: string;
  archiveHint: string;
  yearsLabel: string;
}> = {
  ru: {
    months: [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ],
    // The display headings were English on the Russian site too: brand styling, kept as is.
    eyebrow: "Победители",
    titleLines: ["Лучший игрок", "месяца"],
    lead: "Лучший игрок месяца, который определяется по сыгранным клубным играм. Играем по системе iMafia.",
    allWinners: "Все победители",
    stats: {
      monthly: ["Победителей", "месяца"],
      wins: ["Турнирных", "побед"],
      players: ["Игроков", "в клубе"],
      years: ["Года", "вместе"],
    },
    badge: "Игрок месяца",
    soon: "Скоро",
    photoAlt: (nick) => `${nick} — игрок месяца`,
    archivePhotoAlt: (nick, month) => `${nick} — игрок месяца, ${month}`,
    profile: (nick) => `Профиль ${nick} на iMafia`,
    prev: "Предыдущий месяц",
    next: "Следующий месяц",
    selectMonth: "Выберите месяц",
    archiveTitle: "Архив",
    archiveHint: "Все победители месяца",
    yearsLabel: "Год",
  },
  en: {
    months: [
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
    eyebrow: "Winners",
    titleLines: ["The Best Player", "of the Month"],
    lead: "The club's best player of the month, decided by the club games played. We play by the iMafia system.",
    allWinners: "All winners",
    stats: {
      monthly: ["Monthly", "winners"],
      wins: ["Tournament", "wins"],
      players: ["Players", "in club"],
      years: ["Years", "together"],
    },
    badge: "Player of the Month",
    soon: "Soon",
    photoAlt: (nick) => `${nick}, player of the month`,
    archivePhotoAlt: (nick, month) => `${nick}, player of the month, ${month}`,
    profile: (nick) => `${nick}'s iMafia profile`,
    prev: "Previous month",
    next: "Next month",
    selectMonth: "Select month",
    archiveTitle: "Archive",
    archiveHint: "Every player of the month",
    yearsLabel: "Year",
  },
};
