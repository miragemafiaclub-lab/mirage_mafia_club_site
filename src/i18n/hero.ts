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
  play: string;
  about: string;
  sideWords: string[];
  scroll: string;
}> = {
  ru: {
    bgAlt: "Игроки за столом Mirage Mafia Club",
    subtitle: "Клуб спортивной мафии в Варшаве",
    script: "Делай то, что любишь",
    leadTitle: "Больше, чем просто игра.",
    leadText: "Большое комьюнити людей, которые думают, чувствуют и играют в классном коллективе игроков.",
    nextLabel: "Следующая игра",
    today: "сегодня",
    tomorrow: "завтра",
    days: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
    timeTbd: "время в Telegram",
    play: "Играть с нами",
    about: "О клубе",
    sideWords: ["Люди", "Игра", "Эмоции", "Варшава"],
    scroll: "Листайте",
  },
  en: {
    bgAlt: "Players around the Mirage Mafia Club table",
    subtitle: "Sports mafia club in Warsaw",
    script: "Do what makes you happy",
    leadTitle: "More than just a game.",
    leadText: "A big community of people who think, feel and play together — with a great crowd at the table.",
    nextLabel: "Next game",
    today: "today",
    tomorrow: "tomorrow",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    timeTbd: "time in Telegram",
    play: "Play with us",
    about: "About the club",
    sideWords: ["People", "Game", "Emotions", "Warsaw"],
    scroll: "Scroll",
  },
};
