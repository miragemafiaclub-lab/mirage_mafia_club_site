import type { TournamentFilter } from "../data/tournaments";
import type { Translations } from "./lang";

/** Country names as the sources write them (MafGame's English names) → Russian. Others are shown as written. */
const COUNTRIES_RU: Record<string, string> = {
  Albania: "Албания", Austria: "Австрия", Belgium: "Бельгия", "Bosnia and Herzegovina": "Босния и Герцеговина",
  Bulgaria: "Болгария", Croatia: "Хорватия", Cyprus: "Кипр", "Czech Republic": "Чехия", Denmark: "Дания",
  Egypt: "Египет", Estonia: "Эстония", Finland: "Финляндия", France: "Франция", Georgia: "Грузия",
  Germany: "Германия", Greece: "Греция", Hungary: "Венгрия", Iceland: "Исландия", Ireland: "Ирландия",
  Israel: "Израиль", Italy: "Италия", Latvia: "Латвия", Lithuania: "Литва", Luxembourg: "Люксембург",
  Malta: "Мальта", "Republic of Moldova": "Молдова", Montenegro: "Черногория", Netherlands: "Нидерланды",
  "North Macedonia": "Северная Македония", Norway: "Норвегия", Poland: "Польша", Portugal: "Португалия",
  Romania: "Румыния", Serbia: "Сербия", Slovakia: "Словакия", Slovenia: "Словения", Spain: "Испания",
  Sweden: "Швеция", Switzerland: "Швейцария", "Republic of Türkiye": "Турция", Ukraine: "Украина",
  "United Kingdom": "Великобритания", "United States": "США",
};

/** MafGame's official long names, shortened for English readers. */
const COUNTRIES_EN: Record<string, string> = { "Republic of Moldova": "Moldova", "Republic of Türkiye": "Türkiye" };

export const tournaments: Translations<{
  eyebrow: string;
  title: string;
  lead: string;
  filtersLabel: string;
  filters: Record<TournamentFilter, string>;
  listLabel: (filter: string) => string;
  online: string;
  placeUnknown: string;
  country: (name: string) => string;
  players: string;
  applied: string;
  appliedTitle: string;
  openOn: (source: string) => string;
  openOnLabel: (title: string, source: string) => string;
  updated: (date: string) => string;
  note: string;
  empty: Record<TournamentFilter, string>;
  emptyHint: string;
  imafiaList: string;
  mafgameList: string;
  newTab: string;
  ratingLink: string;
}> = {
  ru: {
    eyebrow: "Календарь",
    title: "Турниры",
    lead: "Ближайшие турниры, в которых заявлены члены клуба Mirage. На три месяца вперёд, по данным iMafia и MafGame.",
    filtersLabel: "Какие турниры показать",
    filters: { europe: "Европа", online: "Онлайн", all: "Все" },
    listLabel: (filter) => `Турниры: ${filter}`,
    online: "Онлайн",
    placeUnknown: "Место уточняется",
    country: (name) => COUNTRIES_RU[name] ?? name,
    players: "Играют от клуба",
    applied: "заявка",
    appliedTitle: "Подана заявка, организатор ещё не подтвердил",
    openOn: (source) => `На ${source}`,
    openOnLabel: (title, source) => `${title} на ${source} (откроется в новой вкладке)`,
    updated: (date) => `Обновлено ${date}`,
    note: "Список собирается раз в день со страниц участников на iMafia и MafGame. Даты — как у организаторов.",
    empty: {
      europe: "В ближайшие три месяца членов клуба нет в списках офлайн-турниров в Европе.",
      online: "В ближайшие три месяца членов клуба нет в списках онлайн-турниров.",
      all: "В ближайшие три месяца членов клуба нет в списках турниров.",
    },
    emptyHint: "Все турниры — на iMafia и MafGame:",
    imafiaList: "Турниры на iMafia",
    mafgameList: "Турниры на MafGame",
    newTab: "(откроется в новой вкладке)",
    ratingLink: "Турниры клуба",
  },
  en: {
    eyebrow: "Calendar",
    title: "Tournaments",
    lead: "Upcoming tournaments Mirage club members have signed up for. Three months ahead, from iMafia and MafGame.",
    filtersLabel: "Which tournaments to show",
    filters: { europe: "Europe", online: "Online", all: "All" },
    listLabel: (filter) => `Tournaments: ${filter}`,
    online: "Online",
    placeUnknown: "Venue to be announced",
    country: (name) => COUNTRIES_EN[name] ?? name,
    players: "Playing for the club",
    applied: "applied",
    appliedTitle: "Applied, not yet confirmed by the organiser",
    openOn: (source) => `On ${source}`,
    openOnLabel: (title, source) => `${title} on ${source} (opens in a new tab)`,
    updated: (date) => `Updated ${date}`,
    note: "Collected once a day from the participant lists on iMafia and MafGame. Dates are as the organisers give them.",
    empty: {
      europe: "No club members are on the lists of offline tournaments in Europe in the next three months.",
      online: "No club members are on the lists of online tournaments in the next three months.",
      all: "No club members are on any tournament lists in the next three months.",
    },
    emptyHint: "All tournaments are listed on iMafia and MafGame:",
    imafiaList: "Tournaments on iMafia",
    mafgameList: "Tournaments on MafGame",
    newTab: "(opens in a new tab)",
    ratingLink: "Club tournaments",
  },
};
