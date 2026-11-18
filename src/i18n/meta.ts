import type { Translations } from "./lang";

export const meta: Translations<{
  siteName: string;
  locale: string;
  home: { title: string; description: string };
  rating: { title: string; description: string };
  tournaments: { title: string; description: string };
  firstTime: { title: string; description: string };
  compare: { title: string; description: string };
  notFound: { title: string; description: string };
  player: {
    title: (nick: string) => string;
    description: (parts: { name?: string; title: string | null; joinedAt?: string }) => string;
    imageAlt: (nick: string) => string;
  };
  defaultImageAlt: string;
}> = {
  ru: {
    siteName: "Mirage Mafia Club",
    locale: "ru_RU",
    home: {
      title: "Mirage Mafia Club — спортивная мафия в Варшаве",
      description:
        "Mirage Mafia Club — клуб спортивной мафии в Варшаве. Открытые игровые вечера по вторникам и пятницам, капитанский стол, день новичка. Ludna 2.",
    },
    rating: {
      title: "Рейтинг клуба — Mirage Mafia Club",
      description: "Рейтинг игроков Mirage Mafia Club по лигам и сезонам iMafia: места, баллы и изменения позиций.",
    },
    tournaments: {
      title: "Турниры — Mirage Mafia Club",
      description: "Ближайшие турниры и результаты игроков Mirage Mafia Club.",
    },
    firstTime: {
      title: "Первый раз на мафии — Mirage Mafia Club",
      description: "Как проходит игровой вечер в Mirage Mafia Club, сколько стоит, где нас найти и как записаться в первый раз.",
    },
    compare: {
      title: "Сравнение игроков — Mirage Mafia Club",
      description: "Сравните двух игроков Mirage Mafia Club: места в рейтинге, игры, победы и роли.",
    },
    notFound: {
      title: "Страница не найдена — Mirage Mafia Club",
      description: "Такой страницы нет. Вернитесь на главную Mirage Mafia Club.",
    },
    player: {
      title: (nick) => `${nick} — игрок Mirage Mafia Club`,
      description: ({ name, title, joinedAt }) =>
        joinedAt
          ? [name, title, `в клубе с ${joinedAt}`].filter(Boolean).join(" · ") + ". Игрок Mirage Mafia Club, Варшава."
          : "Игрок рейтинга Mirage Mafia Club, Варшава: места и результаты в лигах iMafia.",
      imageAlt: (nick) => `${nick}, игрок Mirage Mafia Club`,
    },
    defaultImageAlt: "Игроки Mirage Mafia Club",
  },
  en: {
    siteName: "Mirage Mafia Club",
    locale: "en_US",
    home: {
      title: "Mirage Mafia Club — sports mafia in Warsaw",
      description:
        "Mirage Mafia Club is a sports mafia club in Warsaw. Open game nights on Tuesdays and Fridays, a captains' table and a newcomers' day. Ludna 2.",
    },
    rating: {
      title: "Club rating — Mirage Mafia Club",
      description: "Mirage Mafia Club player rating by iMafia league and season: places, points and position changes.",
    },
    tournaments: {
      title: "Tournaments — Mirage Mafia Club",
      description: "Upcoming tournaments and results of Mirage Mafia Club players.",
    },
    firstTime: {
      title: "First time at mafia — Mirage Mafia Club",
      description: "What a game night at Mirage Mafia Club looks like, what it costs, how to find us and how to sign up for your first game.",
    },
    compare: {
      title: "Compare players — Mirage Mafia Club",
      description: "Compare two Mirage Mafia Club players: rating places, games, wins and roles.",
    },
    notFound: {
      title: "Page not found — Mirage Mafia Club",
      description: "This page does not exist. Go back to the Mirage Mafia Club home page.",
    },
    player: {
      title: (nick) => `${nick} — Mirage Mafia Club player`,
      description: ({ name, title, joinedAt }) =>
        joinedAt
          ? [name, title, `member since ${joinedAt}`].filter(Boolean).join(" · ") + ". Mirage Mafia Club player, Warsaw."
          : "A player in the Mirage Mafia Club rating, Warsaw: places and results in iMafia leagues.",
      imageAlt: (nick) => `${nick}, Mirage Mafia Club player`,
    },
    defaultImageAlt: "Mirage Mafia Club players",
  },
};
