import type { EveningKind } from "../data/visit";
import type { Translations } from "./lang";

type Step = { title: string; text: string };
/** `school`: the answer ends with a link to the mafia school. */
type Question = { q: string; a: string; school?: boolean };

export const firstTime: Translations<{
  eyebrow: string;
  title: string;
  lead: string;
  signup: string;
  signupLabel: string;
  schedule: string;
  facts: { price: (zl: number) => string; priceSub: string; place: string; placeSub: string };

  eveningTitle: string;
  steps: Step[];
  ratingLink: string;

  pricesTitle: string;
  pricesLead: string;
  evenings: Record<EveningKind, { name: string; when: string | null; note: string | null }>;
  recommended: string;
  /** "Вторник и пятница, 18:30" from full weekday names (as in the schedule) and a time. */
  slots: (days: string[], time: string | null) => string;
  timeInTelegram: string;
  /** "обычно 18:30, точное время в Telegram" for an evening whose exact time is announced. */
  usually: (time: string) => string;
  zl: (n: number) => string;
  payment: string;

  findTitle: string;
  address: string;
  building: string;
  route: string[];
  map: string;
  mapLabel: string;

  rulesTitle: string;
  rulesLead: string;
  rules: string[];

  faqTitle: string;
  faq: Question[];
  school: string;
  schoolLabel: string;

  ctaTitle: string;
  ctaText: string;
}> = {
  ru: {
    eyebrow: "Первый раз?",
    title: "Первый раз на мафии",
    lead: "Опыт не нужен. Для первого раза есть День новичка: без регистрации на сайтах и без подготовки. Ниже всё, что стоит знать до прихода.",
    signup: "Записаться в Telegram",
    signupLabel: "Записаться в Telegram (откроется в новой вкладке)",
    schedule: "Расписание",
    facts: {
      price: (zl) => `от ${zl} zł`,
      priceSub: "за вечер, оплата в боте",
      place: "Ludna 2",
      placeSub: "Wisla Plaza, 5 этаж",
    },

    eveningTitle: "Как проходит вечер",
    steps: [
      {
        title: "Запишитесь",
        text: "Напишите нашему боту в Telegram: там запись, точная цена и оплата. В первый раз можно написать и в Instagram.",
      },
      {
        title: "Приходите",
        text: "Ludna 2, 5 этаж. Вечера начинаются в 18:30, День новичка обычно тоже. Точное время всегда в Telegram.",
      },
      {
        title: "Получите роль",
        text: "За столом 10 игроков: 7 мирных, среди них шериф, и 3 мафии, среди них дон. Свою роль знаете только вы.",
      },
      {
        title: "Играйте",
        text: "Днём все по очереди говорят и голосуют, кого вывести из игры. Ночью мафия стреляет, а шериф и дон проверяют. Ведёт игру судья.",
      },
      {
        title: "Смотрите результат",
        text: "Баллы за рейтинговые игры попадают в рейтинг клуба.",
      },
    ],
    ratingLink: "Рейтинг клуба",

    pricesTitle: "Какой вечер выбрать",
    pricesLead: "Для первого раза лучше всего День новичка. Потом можно на любой вечер.",
    evenings: {
      newcomers: { name: "День новичка", when: null, note: "Без регистрации на iMafia" },
      open: { name: "Открытый игровой вечер", when: null, note: null },
      captains: { name: "Капитанский стол", when: null, note: "По приглашению" },
      fun: { name: "Фановый вечер", when: "Анонс в Telegram", note: null },
      mps: {
        name: "Mirage Player Series (МПС)",
        when: "Раз в 2–3 месяца",
        note: "5 недель, одна серия игр в неделю. Расписание в боте",
      },
    },
    recommended: "Для первого раза",
    slots: (days, time) => `${days.map((d, i) => (i ? d.toLowerCase() : d)).join(" и ")}${time ? `, ${time}` : ""}`,
    timeInTelegram: "время в Telegram",
    usually: (time) => `обычно ${time}, точное время в Telegram`,
    zl: (n) => `${n} zł`,
    payment: "Оплата в боте. Бот всегда показывает точную цену при записи.",

    findTitle: "Как нас найти",
    address: "Ludna 2, Варшава",
    building: "Офис Wisla Plaza, 5 этаж",
    route: [
      "Заходите в Wisla Plaza и сразу в лифт.",
      "Поднимайтесь на 5 этаж.",
      "Дважды поверните налево, до двери.",
      "Проходите прямо, нам нужна первая дверь.",
    ],
    map: "Открыть на карте",
    mapLabel: "Открыть адрес на Google Maps (в новой вкладке)",

    rulesTitle: "Правила клуба коротко",
    rulesLead: "Главное из регламента клуба и правил площадки. Остальное подскажет судья.",
    rules: [
      "Телефоны на время игры убираем: на столе их тоже быть не должно.",
      "Вышли из игры? Можно остаться в зале, но без подсказок: жесты и мимика тоже считаются.",
      "Рейтинговые игры идут строго по правилам iMafia. Не согласны с решением, подайте апелляцию судье после игры.",
      "За нечестную игру, сговоры и подставы бан без апелляции.",
      "В нетрезвом виде за рейтинговый стол не садимся.",
      "Вейп только с согласия всех за столом.",
      "Не курим, еда только на кухне.",
      "На стульях не качаемся.",
    ],

    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Я никогда не играл. Это проблема?",
        a: "Нет. День новичка как раз для этого. Правила можно заранее посмотреть в школе мафии.",
        school: true,
      },
      {
        q: "Нужна ли регистрация?",
        a: "На День новичка нет. Для рейтинговых вечеров нужны аккаунты на iMafia и Emotion Games: через них игры попадают в рейтинг.",
      },
      {
        q: "Я приду один и никого не знаю",
        a: "Ничего страшного. Столы собирает судья: вас посадят за стол, а судья ведёт игру и подскажет по ходу.",
      },
      {
        q: "Как стать игроком клуба?",
        a: "В клубе есть кандидаты в члены клуба (КЧК) и члены клуба (ЧК). Кандидатом можно стать после 3 месяцев в клубе, членом клуба после 6 месяцев.",
      },
    ],
    school: "Mafia School",
    schoolLabel: "Mafia School, школа мафии (откроется в новой вкладке)",

    ctaTitle: "Ждём за столом",
    ctaText: "Напишите в Telegram, и мы подскажем ближайший вечер.",
  },
  en: {
    eyebrow: "First time?",
    title: "Your first game of mafia",
    lead: "No experience needed. Newcomers' day is made for a first visit: no sign-up on rating sites, nothing to prepare. Here is everything worth knowing before you come.",
    signup: "Sign up on Telegram",
    signupLabel: "Sign up on Telegram (opens in a new tab)",
    schedule: "Schedule",
    facts: {
      price: (zl) => `from ${zl} zł`,
      priceSub: "per night, paid in the bot",
      place: "Ludna 2",
      placeSub: "Wisla Plaza, 5th floor",
    },

    eveningTitle: "How a game night goes",
    steps: [
      {
        title: "Sign up",
        text: "Message our Telegram bot: that is where you sign up, see the exact price and pay. For your first visit, Instagram works too.",
      },
      {
        title: "Come over",
        text: "Ludna 2, 5th floor. Evenings start at 18:30, and Newcomers' day usually does too. The exact time is always on Telegram.",
      },
      {
        title: "Get a role",
        text: "Ten players at the table: 7 town players, including the sheriff, and 3 mafia, including the don. Only you know your role.",
      },
      {
        title: "Play",
        text: "By day everyone speaks in turn and votes someone out. At night the mafia shoots, while the sheriff and the don check players. A judge runs the game.",
      },
      {
        title: "See the results",
        text: "Points from rating games go into the club rating.",
      },
    ],
    ratingLink: "Club rating",

    pricesTitle: "Which night to pick",
    pricesLead: "Newcomers' day is the best start. After that, any night is open to you.",
    evenings: {
      newcomers: { name: "Newcomers' day", when: null, note: "No iMafia account needed" },
      open: { name: "Open game night", when: null, note: null },
      captains: { name: "Captains' table", when: null, note: "By invitation" },
      fun: { name: "Fun night", when: "Announced on Telegram", note: null },
      mps: {
        name: "Mirage Player Series (MPS)",
        when: "Every 2–3 months",
        note: "5 weeks, one series of games a week. Schedule in the bot",
      },
    },
    recommended: "Best for a first visit",
    slots: (days, time) => `${days.join(" and ")}${time ? `, ${time}` : ""}`,
    timeInTelegram: "time on Telegram",
    usually: (time) => `usually ${time}, exact time on Telegram`,
    zl: (n) => `${n} zł`,
    payment: "You pay in the bot. It always shows the exact price when you sign up.",

    findTitle: "How to find us",
    address: "Ludna 2, Warsaw",
    building: "Wisla Plaza office building, 5th floor",
    route: [
      "Enter Wisla Plaza and go straight to the lift.",
      "Go up to the 5th floor.",
      "Turn left twice, up to the door.",
      "Go straight ahead: it's the first door.",
    ],
    map: "Open the map",
    mapLabel: "Open the address on Google Maps (in a new tab)",

    rulesTitle: "Club rules in brief",
    rulesLead: "The essentials from the club regulation and the venue rules. The judge will help with the rest.",
    rules: [
      "Phones away during the game, and not on the table either.",
      "Out of the game? You can stay in the room, but no hints: gestures and faces count too.",
      "Rating games follow the iMafia rules strictly. Disagree with a call? Appeal to the judge after the game.",
      "Cheating, collusion and set-ups mean a ban with no appeal.",
      "No playing rating games while drunk.",
      "Vaping only if everyone at the table agrees.",
      "No smoking, and food stays in the kitchen.",
      "No rocking on the chairs.",
    ],

    faqTitle: "Questions",
    faq: [
      {
        q: "I have never played. Is that a problem?",
        a: "Not at all. That is what Newcomers' day is for. You can also read the rules beforehand at the mafia school.",
        school: true,
      },
      {
        q: "Do I need to register anywhere?",
        a: "Not for Newcomers' day. Rating nights need accounts on iMafia and Emotion Games: that is how games get into the rating.",
      },
      {
        q: "I'm coming alone and don't know anyone",
        a: "That's fine. The judge puts the tables together: you get a seat, and the judge runs the game and helps you along.",
      },
      {
        q: "How do I become a club player?",
        a: "The club has candidate members (KChK) and members (ChK). You can become a candidate after 3 months at the club, and a member after 6 months.",
      },
    ],
    school: "Mafia School",
    schoolLabel: "Mafia School (opens in a new tab)",

    ctaTitle: "See you at the table",
    ctaText: "Message us on Telegram and we will tell you about the nearest night.",
  },
};
