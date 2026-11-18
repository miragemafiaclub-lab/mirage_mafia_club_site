import type { Translations } from "./lang";

type StubCopy = { eyebrow: string; title: string; text: string };

export const pages: Translations<{
  soon: string;
  toHome: string;
  tournaments: StubCopy;
  notFound: { eyebrow: string; title: string; text: string; schedule: string; photoAlt: string; caption: string };
  player: {
    back: string;
    joined: string;
    about: string;
    guest: string;
    imafia: string;
    photoAlt: (nick: string) => string;
  };
}> = {
  ru: {
    soon: "Скоро",
    toHome: "На главную",
    tournaments: {
      eyebrow: "Турниры",
      title: "Турниры",
      text: "Здесь будет календарь ближайших турниров и результаты игроков Mirage. Готовим.",
    },
    notFound: {
      eyebrow: "404",
      title: "Этой страницы нет за столом",
      text: "Похоже, её выставили на голосовании. Вернитесь на главную или загляните в расписание.",
      schedule: "Расписание",
      photoAlt: "Игрок в маске за столом Mirage: в мафии ночью город спит",
      caption: "Город засыпает…",
    },
    player: {
      back: "Все игроки",
      joined: "В клубе с",
      about: "О себе",
      guest: "Игрок рейтинга клуба",
      imafia: "Профиль на iMafia",
      photoAlt: (nick) => `${nick}, игрок Mirage Mafia Club`,
    },
  },
  en: {
    soon: "Coming soon",
    toHome: "Home",
    tournaments: {
      eyebrow: "Tournaments",
      title: "Tournaments",
      text: "A calendar of upcoming tournaments and Mirage players' results is coming here.",
    },
    notFound: {
      eyebrow: "404",
      title: "This page isn't at the table",
      text: "Looks like it got voted out. Head back to the home page or check the schedule.",
      schedule: "Schedule",
      photoAlt: "A masked player at a Mirage table: in mafia, the town sleeps at night",
      caption: "The town falls asleep…",
    },
    player: {
      back: "All players",
      joined: "Member since",
      about: "About",
      guest: "Club rating player",
      imafia: "iMafia profile",
      photoAlt: (nick) => `${nick}, Mirage Mafia Club player`,
    },
  },
};
