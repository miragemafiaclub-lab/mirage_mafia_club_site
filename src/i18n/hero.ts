import type { Translations } from "./lang";

export const hero: Translations<{
  bgAlt: string;
  subtitle: string;
  script: string;
  leadTitle: string;
  leadText: string;
  nextLabel: string;
  today: string;
  tomorrow: string;
  // Short weekday names, Monday first (index from weekIndex()).
  days: string[];
  timeTbd: string;
  /** "от 50 zł" next to the next game. */
  fromPrice: (zl: number) => string;
  play: string;
  firstTime: string;
  sideWords: string[];
  scroll: string;
}> = {
  ru: {
    bgAlt: "Игроки за столом Mirage Mafia Club",
    subtitle: "Клуб спортивной мафии в Варшаве",
    script: "Делай то, что любишь",
    leadTitle: "Командная игра на логику и блеф:",
    leadText: "10 игроков за столом, судья ведёт игру, опыт не нужен.",
    nextLabel: "Следующая игра",
    today: "сегодня",
    tomorrow: "завтра",
    days: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
    timeTbd: "время в Telegram",
    fromPrice: (zl) => `от ${zl} zł`,
    play: "Играть с нами",
    firstTime: "Первый раз?",
    sideWords: ["Люди", "Игра", "Эмоции", "Варшава"],
    scroll: "Листайте",
  },
  en: {
    bgAlt: "Players around the Mirage Mafia Club table",
    subtitle: "Sports mafia club in Warsaw",
    script: "Do what makes you happy",
    leadTitle: "A team game of logic and bluff:",
    leadText: "10 players at the table, a judge runs the game, no experience needed.",
    nextLabel: "Next game",
    today: "today",
    tomorrow: "tomorrow",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    timeTbd: "time in Telegram",
    fromPrice: (zl) => `from ${zl} zł`,
    play: "Play with us",
    firstTime: "First time?",
    sideWords: ["People", "Game", "Emotions", "Warsaw"],
    scroll: "Scroll",
  },
};
