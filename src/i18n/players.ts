import type { Translations } from "./lang";

type GroupCopy = {
  shortTitle: string;
  title: string;
  subtitle: string;
  description: string;
};

export const players: Translations<{
  eyebrow: string;
  tabsLabel: string;
  groups: Record<"chk" | "kchk", GroupCopy>;
  ctaLabel: string;
  joined: string;
  prevPlayers: string;
  nextPlayers: string;
  closeProfile: string;
  about: string;
  back: string;
  footerCity: string;
}> = {
  ru: {
    eyebrow: "Игроки",
    tabsLabel: "Состав клуба",
    groups: {
      chk: {
        shortTitle: "ЧК",
        title: "Члены Клуба",
        subtitle: "Основной состав клуба",
        description:
          "Ядро Mirage: опытные игроки, которые представляют клуб на турнирах и вносят главный вклад в его жизнь.",
      },
      kchk: {
        shortTitle: "КЧК",
        title: "Кандидаты в Члены Клуба",
        subtitle: "Расширенный состав клуба",
        description:
          "Активные игроки клуба, которые создают атмосферу, развиваются и вносят важный вклад в жизнь Mirage.",
      },
    },
    ctaLabel: "Все игроки клуба",
    joined: "В клубе с",
    prevPlayers: "Предыдущие игроки",
    nextPlayers: "Следующие игроки",
    closeProfile: "Закрыть профиль",
    about: "О себе",
    back: "Назад",
    footerCity: "Варшава · с 2023 года",
  },
  en: {
    eyebrow: "Players",
    tabsLabel: "Club roster",
    groups: {
      chk: {
        shortTitle: "Members",
        title: "Club Members",
        subtitle: "The club's core roster",
        description:
          "The core of Mirage: experienced players who represent the club at tournaments and do the most to shape its life.",
      },
      kchk: {
        shortTitle: "Candidates",
        title: "Membership Candidates",
        subtitle: "The extended roster",
        description:
          "Active players who set the atmosphere, keep improving and make a real contribution to life at Mirage.",
      },
    },
    ctaLabel: "All club players",
    joined: "Member since",
    prevPlayers: "Previous players",
    nextPlayers: "Next players",
    closeProfile: "Close profile",
    about: "About",
    back: "Back",
    footerCity: "Warsaw · Est. 2023",
  },
};
