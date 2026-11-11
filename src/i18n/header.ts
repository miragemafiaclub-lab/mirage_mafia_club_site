import type { Translations } from "./lang";

export type NavId = "about" | "players" | "winners" | "podium" | "schedule" | "contact";

export const header: Translations<{
  skip: string;
  homeLabel: string;
  logoAlt: string;
  navLabel: string;
  nav: Record<NavId, string>;
  cta: string;
  ctaShort: string;
  menuOpen: string;
  menuClose: string;
  menuLabel: string;
  langLabel: string;
  langNames: { ru: string; en: string };
  instagram: string;
  telegram: string;
}> = {
  ru: {
    skip: "К содержанию",
    homeLabel: "Mirage Mafia Club — на главную",
    logoAlt: "Логотип Mirage Mafia Club",
    navLabel: "Основное меню",
    nav: {
      about: "О клубе",
      players: "Игроки",
      winners: "Победители",
      podium: "Пьедестал",
      schedule: "Расписание",
      contact: "Контакты",
    },
    cta: "Записаться на игру",
    ctaShort: "Записаться",
    menuOpen: "Открыть меню",
    menuClose: "Закрыть меню",
    menuLabel: "Меню",
    langLabel: "Язык сайта",
    langNames: { ru: "Русский", en: "English" },
    instagram: "Instagram клуба (откроется в новой вкладке)",
    telegram: "Telegram клуба (откроется в новой вкладке)",
  },
  en: {
    skip: "Skip to content",
    homeLabel: "Mirage Mafia Club — home",
    logoAlt: "Mirage Mafia Club logo",
    navLabel: "Main menu",
    nav: {
      about: "About",
      players: "Players",
      winners: "Winners",
      podium: "Podium",
      schedule: "Schedule",
      contact: "Contacts",
    },
    cta: "Join the game",
    ctaShort: "Join",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    menuLabel: "Menu",
    langLabel: "Site language",
    langNames: { ru: "Русский", en: "English" },
    instagram: "Club Instagram (opens in a new tab)",
    telegram: "Club Telegram (opens in a new tab)",
  },
};
