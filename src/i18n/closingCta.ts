import type { Translations } from "./lang";

export const closingCta: Translations<{
  eyebrow: string;
  title: string;
  /** Label for the next game line. */
  nextLabel: string;
  place: string;
  /** "от 50 zł". */
  fromPrice: (zl: number) => string;
  signup: string;
  signupLabel: string;
  firstTime: string;
}> = {
  ru: {
    eyebrow: "Приходите играть",
    title: "Сыграем вместе?",
    nextLabel: "Ближайшая игра",
    place: "Ludna 2, 5 этаж",
    fromPrice: (zl) => `от ${zl} zł`,
    signup: "Записаться через бот",
    signupLabel: "Записаться через бот клуба в Telegram (откроется в новой вкладке)",
    firstTime: "Первый раз?",
  },
  en: {
    eyebrow: "Come and play",
    title: "Join a game?",
    nextLabel: "Next game",
    place: "Ludna 2, 5th floor",
    fromPrice: (zl) => `from ${zl} zł`,
    signup: "Sign up via the bot",
    signupLabel: "Sign up via the club bot on Telegram (opens in a new tab)",
    firstTime: "First time?",
  },
};
