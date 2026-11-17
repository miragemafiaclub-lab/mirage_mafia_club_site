import type { Translations } from "./lang";

type StubCopy = { eyebrow: string; title: string; text: string };

export const pages: Translations<{
  soon: string;
  toHome: string;
  rating: StubCopy;
  tournaments: StubCopy;
  firstTime: StubCopy;
  notFound: { eyebrow: string; title: string; text: string };
  player: {
    back: string;
    joined: string;
    about: string;
    photoAlt: (nick: string) => string;
  };
}> = {
  ru: {
    soon: "Скоро",
    toHome: "На главную",
    rating: {
      eyebrow: "Рейтинг",
      title: "Рейтинг клуба",
      text: "Здесь будет рейтинг игроков по лигам и сезонам iMafia: места, баллы и как они меняются. Готовим.",
    },
    tournaments: {
      eyebrow: "Турниры",
      title: "Турниры",
      text: "Здесь будет календарь ближайших турниров и результаты игроков Mirage. Готовим.",
    },
    firstTime: {
      eyebrow: "Первый раз?",
      title: "Первый раз на мафии",
      text: "Здесь будет всё для первого визита: как проходит вечер, сколько стоит, как нас найти и записаться. Пока пишите нам в Telegram.",
    },
    notFound: {
      eyebrow: "404",
      title: "Этой страницы нет за столом",
      text: "Похоже, её выставили на голосовании. Вернитесь на главную.",
    },
    player: {
      back: "Все игроки",
      joined: "В клубе с",
      about: "О себе",
      photoAlt: (nick) => `${nick}, игрок Mirage Mafia Club`,
    },
  },
  en: {
    soon: "Coming soon",
    toHome: "Home",
    rating: {
      eyebrow: "Rating",
      title: "Club rating",
      text: "The player rating by iMafia league and season is coming here: places, points and how they change.",
    },
    tournaments: {
      eyebrow: "Tournaments",
      title: "Tournaments",
      text: "A calendar of upcoming tournaments and Mirage players' results is coming here.",
    },
    firstTime: {
      eyebrow: "First time?",
      title: "Your first game of mafia",
      text: "Everything for your first visit is coming here: how a game night goes, the price, how to find us and sign up. Meanwhile, message us on Telegram.",
    },
    notFound: {
      eyebrow: "404",
      title: "This page isn't at the table",
      text: "Looks like it got voted out. Head back to the home page.",
    },
    player: {
      back: "All players",
      joined: "Member since",
      about: "About",
      photoAlt: (nick) => `${nick}, Mirage Mafia Club player`,
    },
  },
};
