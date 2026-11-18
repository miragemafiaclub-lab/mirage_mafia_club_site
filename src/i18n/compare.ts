import type { Translations } from "./lang";

export const compare: Translations<{
  eyebrow: string;
  title: string;
  lead: string;
  pick: (n: 1 | 2) => string;
  placeholder: string;
  notFound: string;
  choose: string;
  rows: {
    annual: string;
    month: string;
    games: string;
    wins: string;
    winRate: string;
    mvp: string;
    prizes: string;
    cups: string;
    don: string;
    mafia: string;
    civilian: string;
    sheriff: string;
  };
  better: string;
  compareWith: string;
  go: string;
  suggest: string;
  pairKinds: Record<"annual" | "month" | "leaders" | "winners", string>;
  pairLabel: (a: string, b: string) => string;
  slotHint: string;
}> = {
  ru: {
    eyebrow: "Сравнение",
    title: "Сравнение игроков",
    lead: "Выберите двух игроков: места в рейтингах клуба и статистика iMafia рядом.",
    pick: (n) => `Игрок ${n}`,
    placeholder: "Начните вводить ник",
    notFound: "Такого игрока нет в рейтинге клуба",
    choose: "Выберите двух игроков, чтобы сравнить их.",
    rows: {
      annual: "Место в годовом рейтинге",
      month: "Место в последнем месяце",
      games: "Игр в году",
      wins: "Побед в году",
      winRate: "Винрейт на iMafia",
      mvp: "MVP месяца",
      prizes: "Призовых мест на турнирах",
      cups: "Кубков и медалей iMafia",
      don: "Винрейт за дона",
      mafia: "Винрейт за мафию",
      civilian: "Винрейт за мирного",
      sheriff: "Винрейт за шерифа",
    },
    better: "лучше",
    compareWith: "Сравнить с другим игроком",
    go: "Сравнить",
    suggest: "Или начните с готовой пары",
    pairKinds: {
      annual: "Топ-2 года",
      month: "Топ-2 месяца",
      leaders: "Лидер года и лидер месяца",
      winners: "Два последних игрока месяца",
    },
    pairLabel: (a, b) => `Сравнить ${a} и ${b}`,
    slotHint: "Выберите игрока",
  },
  en: {
    eyebrow: "Compare",
    title: "Compare players",
    lead: "Pick two players to see their club rating places and iMafia stats side by side.",
    pick: (n) => `Player ${n}`,
    placeholder: "Start typing a nick",
    notFound: "No such player in the club rating",
    choose: "Pick two players to compare them.",
    rows: {
      annual: "Annual rating place",
      month: "Place last month",
      games: "Games this year",
      wins: "Wins this year",
      winRate: "iMafia win rate",
      mvp: "MVP of the month",
      prizes: "Tournament prize places",
      cups: "iMafia cups and medals",
      don: "Win rate as Don",
      mafia: "Win rate as Mafia",
      civilian: "Win rate as Civilian",
      sheriff: "Win rate as Sheriff",
    },
    better: "better",
    compareWith: "Compare with another player",
    go: "Compare",
    suggest: "Or start with a ready-made pair",
    pairKinds: {
      annual: "Top 2 of the year",
      month: "Top 2 of the month",
      leaders: "Leader of the year vs. of the month",
      winners: "Last two players of the month",
    },
    pairLabel: (a, b) => `Compare ${a} and ${b}`,
    slotHint: "Pick a player",
  },
};
