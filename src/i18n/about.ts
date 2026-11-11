import type { Translations } from "./lang";

type AboutStrings = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  founded: string;
  awardAccent: string;
  awardRest: string;
  residents: string;
  rhythm: string;
  cta: string;
  imafiaLink: string;
  imafiaLinkLabel: string;
  stats: {
    players: { label: string; sub: string };
    perWeek: { label: string; sub: string };
    wins: { label: string; sub: string };
    venue: { label: string; sub: string };
    school: { value: string; label: string; sub: string };
  };
  alts: {
    awards: string;
    small: string;
    trophies: string;
    main: string;
    accent: string;
    podium: string;
    group: string;
  };
};

export const about: Translations<AboutStrings> = {
  ru: {
    eyebrow: "Больше, чем игра",
    titleLine1: "Mirage — клуб спортивной",
    titleLine2: "мафии в Варшаве",
    founded: "Дата создания клуба — 28.08.2023 г.",
    awardAccent: "Лучший клуб 2025 года",
    awardRest: " по версии iMafia.",
    residents:
      "В состав резидентов клуба входят одни из сильнейших игроков в мафию, которые занимают призовые места на международных турнирах.",
    rhythm: "Мы играем 4–5 раз в неделю, постоянно проводим клубные серии и мини-турниры. Развиваемся и растём вместе!",
    cta: "Стать частью клуба",
    imafiaLink: "Клуб на iMafia",
    imafiaLinkLabel: "Клуб на iMafia (откроется в новой вкладке)",
    stats: {
      players: { label: "Игроки", sub: "в составе клуба" },
      perWeek: { label: "В неделю", sub: "игровых вечеров" },
      wins: { label: "Победы", sub: "на турнирах" },
      venue: { label: "Своё помещение", sub: "в центре Варшавы" },
      school: { value: "Mafia School", label: "Обучение", sub: "школа мафии" },
    },
    alts: {
      awards: "Резиденты клуба Mirage с наградами Kraków Supreme Cup",
      small: "Игрок клуба Mirage в маске за столом",
      trophies: "Победители турнира клуба Mirage",
      main: "Резиденты клуба Mirage с наградами",
      accent: "Игроки клуба Mirage",
      podium: "Победители турнира клуба Mirage с кубками",
      group: "Резиденты клуба Mirage на прогулке по Варшаве",
    },
  },
  en: {
    eyebrow: "More than a game",
    titleLine1: "Mirage — a competitive",
    titleLine2: "mafia club in Warsaw",
    founded: "Founded on 28 August 2023.",
    awardAccent: "Best club of 2025",
    awardRest: " according to iMafia.",
    residents:
      "Our residents include some of the strongest mafia players around, regularly placing at international tournaments.",
    rhythm: "We play 4–5 times a week and run club series and mini-tournaments all year round. We grow together!",
    cta: "Join the club",
    imafiaLink: "Club on iMafia",
    imafiaLinkLabel: "Club on iMafia (opens in a new tab)",
    stats: {
      players: { label: "Players", sub: "in the club" },
      perWeek: { label: "A week", sub: "game nights" },
      wins: { label: "Tournament wins", sub: "and counting" },
      venue: { label: "Own venue", sub: "in central Warsaw" },
      school: { value: "Mafia School", label: "Education", sub: "learn to play with us" },
    },
    alts: {
      awards: "Mirage club residents with Kraków Supreme Cup awards",
      small: "A masked Mirage player at the table",
      trophies: "Tournament winners from the Mirage club",
      main: "Mirage club residents with their awards",
      accent: "Mirage club players",
      podium: "Mirage tournament winners holding their trophies",
      group: "Mirage club residents on a walk around Warsaw",
    },
  },
};
