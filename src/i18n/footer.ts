import type { Translations } from "./lang";

export const footer: Translations<{
  tagline: string;
  addressTitle: string;
  floor: string;
  city: string;
  mapLabel: string;
  contactTitle: string;
  signup: string;
  channel: string;
  instagram: string;
  imafia: string;
  newTab: string;
  rights: string;
}> = {
  ru: {
    tagline: "Клуб спортивной мафии в Варшаве",
    addressTitle: "Адрес",
    floor: "5 этаж",
    city: "Варшава",
    mapLabel: "Открыть на карте",
    contactTitle: "Связь",
    signup: "Запись на игры — бот в Telegram",
    channel: "Telegram-канал — новости клуба",
    instagram: "Instagram",
    imafia: "Клуб на iMafia",
    newTab: "(откроется в новой вкладке)",
    rights: "Все права защищены.",
  },
  en: {
    tagline: "Sports mafia club in Warsaw",
    addressTitle: "Address",
    floor: "5th floor",
    city: "Warsaw",
    mapLabel: "Open in maps",
    contactTitle: "Contact",
    signup: "Sign up for games — Telegram bot",
    channel: "Telegram channel — club news",
    instagram: "Instagram",
    imafia: "Club on iMafia",
    newTab: "(opens in a new tab)",
    rights: "All rights reserved.",
  },
};
