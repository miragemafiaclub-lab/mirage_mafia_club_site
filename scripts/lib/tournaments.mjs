// Parsers for the upcoming-tournament pages of imafia.org and mafgame.org, and the Europe / online / other
// split. No network here: everything takes page text, so it is tested on saved snippets
// (scripts/__fixtures__/tournaments). Used by scripts/sync-tournaments.mjs.
import { normalizeNick, readInertiaProps, stripTags } from "./sources.mjs";

// ---------- Where a tournament is ----------

/**
 * Countries counted as «Европа» on the page: the EU, the EEA, the UK, Switzerland, the Western Balkans,
 * Ukraine and Moldova — places a player from Warsaw would travel to for a weekend tournament.
 * Not counted (they go under «Все» only): Russia, Belarus, Türkiye, Georgia, Armenia, Azerbaijan, Israel,
 * Egypt and anything else. Keys are English names as MafGame spells them; NAMES adds other spellings.
 */
export const EUROPE = new Set([
  "Albania", "Andorra", "Austria", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland",
  "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta",
  "Republic of Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland",
  "Portugal", "Romania", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland",
  "Ukraine", "United Kingdom",
]);

/** Other spellings of country names (Russian, Ukrainian, short English) → the name used above. */
const COUNTRY_ALIASES = {
  Czechia: "Czech Republic", Moldova: "Republic of Moldova", UK: "United Kingdom", England: "United Kingdom",
  Turkey: "Republic of Türkiye", Türkiye: "Republic of Türkiye",
  Польша: "Poland", Польща: "Poland", Германия: "Germany", Німеччина: "Germany", Австрия: "Austria",
  Австрія: "Austria", Чехия: "Czech Republic", Чехія: "Czech Republic", Украина: "Ukraine", Україна: "Ukraine",
  Молдова: "Republic of Moldova", Литва: "Lithuania", Латвия: "Latvia", Латвія: "Latvia", Эстония: "Estonia",
  Испания: "Spain", Іспанія: "Spain", Италия: "Italy", Італія: "Italy", Франция: "France", Франція: "France",
  Нидерланды: "Netherlands", Кипр: "Cyprus", Кіпр: "Cyprus", Сербия: "Serbia", Сербія: "Serbia",
  Израиль: "Israel", Ізраїль: "Israel", Грузия: "Georgia", Грузія: "Georgia", Турция: "Republic of Türkiye",
};

/**
 * iMafia gives only a city (in any language). Cities seen on iMafia and MafGame, and the usual tournament
 * cities around them; anything not here stays without a country (and so under «Все» only).
 */
const CITIES = {
  Poland: ["Warsaw", "Warszawa", "Варшава", "Krakow", "Kraków", "Краков", "Краків", "Wroclaw", "Wrocław", "Вроцлав",
    "Lodz", "Łódź", "Лодзь", "Gdansk", "Gdańsk", "Гданьск", "Гданськ", "Poznan", "Poznań", "Познань", "Katowice",
    "Катовице", "Lublin", "Люблин", "Люблін", "Szczecin", "Bialystok", "Białystok", "Rzeszow", "Rzeszów",
    // The venue of the Poland Mafia Cup on iMafia.
    "Górski Raj"],
  Germany: ["Berlin", "Берлин", "Берлін", "Munich", "München", "Мюнхен", "Cologne", "Köln", "Кельн", "Frankfurt",
    "Frankfurt am Main", "Франкфурт", "Hamburg", "Гамбург", "Bamberg", "Бамберг", "Dortmund", "Дортмунд",
    "Dusseldorf", "Düsseldorf", "Дюссельдорф", "Stuttgart", "Штутгарт", "Leipzig", "Лейпциг", "Chemnitz", "Hannover"],
  Austria: ["Vienna", "Wien", "Вена", "Відень"],
  "Czech Republic": ["Prague", "Praha", "Прага", "Brno", "Брно"],
  Ukraine: ["Kyiv", "Kiev", "Київ", "Киев", "Odesa", "Odessa", "Одеса", "Одесса", "Dnipro", "Дніпро", "Днепр",
    "Lviv", "Львів", "Львов", "Kharkiv", "Харків", "Харьков", "Kremenchuk", "Кременчук", "Zaporizhzhia",
    "Запоріжжя", "Запорожье", "Vinnytsia", "Вінниця", "Винница", "Ivano-Frankivsk", "Івано-Франківськ",
    "Uzhhorod", "Ужгород", "Chernivtsi", "Чернівці", "Poltava", "Полтава", "Mykolaiv", "Миколаїв", "Николаев"],
  Lithuania: ["Vilnius", "Вильнюс", "Вільнюс", "Kaunas", "Каунас"],
  Latvia: ["Riga", "Рига", "Рига"],
  Estonia: ["Tallinn", "Таллин", "Таллінн"],
  "Republic of Moldova": ["Chisinau", "Chișinău", "Кишинев", "Кишинёв", "Кишинів"],
  Hungary: ["Budapest", "Будапешт"],
  Slovakia: ["Bratislava", "Братислава"],
  Spain: ["Barcelona", "Барселона", "Madrid", "Мадрид", "Valencia", "Валенсия", "Alicante", "Аликанте"],
  Portugal: ["Lisbon", "Lisboa", "Лиссабон", "Porto"],
  France: ["Paris", "Париж"],
  "United Kingdom": ["London", "Лондон"],
  Netherlands: ["Amsterdam", "Амстердам", "Rotterdam"],
  Belgium: ["Brussels", "City of Brussels", "Брюссель", "Antwerp"],
  Switzerland: ["Bern", "Berne", "Берн", "Zurich", "Zürich", "Цюрих", "Geneva", "Женева"],
  Italy: ["Milan", "Milano", "Милан", "Rome", "Roma", "Рим"],
  Cyprus: ["Limassol", "Лимассол", "Лімасол", "Larnaca", "Ларнака", "Paphos", "Пафос", "Nicosia"],
  Serbia: ["Belgrade", "Белград", "Novi Sad", "Нови-Сад"],
  Montenegro: ["Budva", "Будва", "Podgorica", "Bar"],
  Bulgaria: ["Sofia", "София", "Varna", "Варна"],
  Romania: ["Bucharest", "Бухарест"],
  Georgia: ["Tbilisi", "Тбилиси", "Тбілісі", "Batumi", "Батуми", "Батумі"],
  Israel: ["Tel Aviv", "Тель-Авив", "Ramat-Gan", "Ramat Gan", "Haifa", "Хайфа", "Rishon LeZiyyon"],
  "Republic of Türkiye": ["Antalya", "Анталья", "Istanbul", "Стамбул"],
};

const key = (text) => text.normalize("NFKC").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");

const COUNTRY_BY_KEY = new Map();
for (const name of [...EUROPE, ...Object.keys(CITIES)]) COUNTRY_BY_KEY.set(key(name), name);
for (const [alias, name] of Object.entries(COUNTRY_ALIASES)) COUNTRY_BY_KEY.set(key(alias), name);
const CITY_BY_KEY = new Map();
for (const [country, cities] of Object.entries(CITIES)) for (const city of cities) CITY_BY_KEY.set(key(city), country);

/** Our own club, as organisers write it in the location ("Mirage Mafia Club, Ludna 2"). */
const HOME_VENUE = /mirage\s*mafia|ludna\s*2/i;

/** The country of a free-text location ("Bamberg, Germany", "Краков", "Warsaw"), or null when unknown. */
export function countryOf(location) {
  if (HOME_VENUE.test(location)) return "Poland";
  const parts = location.split(/[,(]/).map((part) => key(part)).filter(Boolean);
  for (const part of parts) if (COUNTRY_BY_KEY.has(part)) return COUNTRY_BY_KEY.get(part);
  for (const part of parts) if (CITY_BY_KEY.has(part)) return CITY_BY_KEY.get(part);
  return null;
}

/** "europe" | "online" | "other": online when the source says so, Europe by country, anything unknown is "other". */
export function classify({ online, country }) {
  if (online) return "online";
  return country && EUROPE.has(country) ? "europe" : "other";
}

// ---------- iMafia ----------

/** iMafia's regions on the list ("Warsaw, Європа"). Swipeal is its online platform. */
const IMAFIA_ONLINE = /online|онлайн|swipeal/i;

const ddmmyyyy = (day, month, year) => `${year.length === 2 ? `20${year}` : year}-${month}-${day}`;

/**
 * Tournament cards on imafia.org/tournaments (the default "Заплановані" filter), in page order:
 * [{ id, start, title, location, region }]. location is the list's short form, often cut with "…".
 */
export function parseImafiaList(html) {
  return [...html.matchAll(/href="\/tournament\/(\d+)" class="tournaments_item_link">(.*?)<\/a>/gs)].map((match) => {
    const card = match[2];
    const field = (name) => stripTags(card.match(new RegExp(`class="tournaments_item_${name}">(.*?)</div>`, "s"))?.[1] ?? "");
    const date = field("date").match(/^(\d\d)\.(\d\d)\.(\d{4}|\d\d)(?!\d)/);
    if (!date) throw new Error(`iMafia: no date for tournament ${match[1]}`);
    const place = field("location").replace(/&#8230;/g, "…");
    const parts = place.split(",").map((part) => part.trim());
    return {
      id: match[1],
      start: ddmmyyyy(date[1], date[2], date[3]),
      title: field("name"),
      location: parts.slice(0, -1).join(", "),
      region: parts.length > 1 ? parts.at(-1) : "",
    };
  });
}

/** "Підтверджені" (confirmed) and other lists of applicants; "Відхилені" (rejected) is skipped. */
const REJECTED = /відхил|отклон|reject/i;
const CONFIRMED = /підтвердж|подтвержд|confirm/i;

/**
 * One tournament page, imafia.org/tournament/<id>:
 * { title, location, start, end, participants: [{ id, nick, status: "confirmed" | "applied" }] }.
 */
export function parseImafiaTournament(html) {
  const infoStart = html.indexOf('id="tournament-info"');
  if (infoStart === -1) throw new Error("iMafia: tournament info block not found");
  const infoHtml = html.slice(infoStart, html.indexOf('id="tournament-results"', infoStart));
  const rows = new Map(
    [...infoHtml.matchAll(/<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/gs)].map((row) => [
      stripTags(row[1]),
      stripTags(row[2]),
    ]),
  );
  const dates = (rows.get("Дата") ?? "").match(/(\d\d)\.(\d\d)\.(\d{4})(?: - (\d\d)\.(\d\d)\.(\d{4}))?/);
  if (!dates) throw new Error("iMafia: tournament date not found");
  const start = ddmmyyyy(dates[1], dates[2], dates[3]);
  const end = dates[4] ? ddmmyyyy(dates[4], dates[5], dates[6]) : start;

  const listStart = html.indexOf('id="tournament-participants"');
  if (listStart === -1) throw new Error("iMafia: participants block not found");
  // Up to the next tab block (appeals, referees…).
  const listEnd = html.indexOf('content_tabs_block_js"', listStart);
  const list = html.slice(listStart, listEnd === -1 ? undefined : listEnd);
  // The list is split by headings ("Підтверджені", "Відхилені"); players before any heading count as applied.
  const participants = [];
  let status = "applied";
  for (const match of list.matchAll(/class="title_small">(.*?)<\/div>|<a href="\/u\/(\d+)" class="player_link">\s*<span class="player_link_name">(.*?)<\/span>/gs)) {
    if (match[1] !== undefined) {
      const heading = stripTags(match[1]);
      status = REJECTED.test(heading) ? "rejected" : CONFIRMED.test(heading) ? "confirmed" : "applied";
    } else if (status !== "rejected") {
      participants.push({ id: match[2], nick: stripTags(match[3]), status });
    }
  }

  return {
    title: stripTags(html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1] ?? "").replace(/ ?share$/, ""),
    location: rows.get("Локація") ?? "",
    start,
    end,
    participants,
  };
}

/** Where an iMafia tournament is, from the full location on its page and the region on the list. */
export function imafiaPlace(location, region) {
  const online = IMAFIA_ONLINE.test(region) || IMAFIA_ONLINE.test(location);
  // The region is a country only for Ukraine; the others (Європа, Кавказ, Америка) are too wide.
  const country = online ? null : (countryOf(location) ?? (/^Україна$/.test(region) ? "Ukraine" : null));
  const city = online ? "" : location.split(",")[0].trim();
  return { online, country, city };
}

// ---------- MafGame ----------

const CANCELLED = /^\W*(отмена|скасовано|cancel)/i;

/** Tournaments on mafgame.org/tournaments?s=planned: { items: [{ id, title, start, city, country, online }], lastPage }. */
export function parseMafgameList(html) {
  const results = readInertiaProps(html).search_results;
  if (!results || !Array.isArray(results.data)) throw new Error("MafGame: tournament list not found");
  return {
    lastPage: results.last_page,
    items: results.data.map((t) => ({
      id: t.id,
      title: t.name.trim(),
      start: t.start_date,
      city: t.city ?? "",
      country: t.country ?? null,
      online: Boolean(t.online),
      cancelled: CANCELLED.test(t.name),
    })),
  };
}

/**
 * mafgame.org/tournaments/<id>/participants: { days, online, cancelled, players: [{ userId, nick, name, clubId, status }] }.
 * Visitors who are not logged in see the players once the organiser has confirmed the list
 * (players_confirmed); open applications are shown only when the page gives them.
 */
export function parseMafgameParticipants(html) {
  const props = readInertiaProps(html);
  const t = props.tournament;
  if (!t || !t.start_date) throw new Error("MafGame: tournament data not found");
  const person = (user, nickname) => ({
    userId: user?.id ?? null,
    nick: (nickname ?? user?.nickname ?? "").trim(),
    name: (user?.display_name ?? "").trim(),
    clubId: user?.club_id ?? null,
  });
  const players = (props.players ?? []).map((p) => ({ ...person(p.user, p.nickname), status: "confirmed" }));
  const seen = new Set(players.map((p) => p.userId));
  for (const application of [...(props.applications ?? []), ...(props.wait_list ?? [])]) {
    if (!application?.user || seen.has(application.user.id) || /reject|revok|cancel/i.test(application.status ?? "")) continue;
    seen.add(application.user.id);
    players.push({ ...person(application.user), status: "applied" });
  }
  return {
    start: t.start_date,
    days: t.days || 1,
    online: Boolean(t.online),
    cancelled: /cancel/i.test(t.status ?? ""),
    players,
  };
}

// ---------- Who of ours ----------

/**
 * The roster players in a MafGame participant list. Nicks repeat across clubs, so a nick match also needs
 * MafGame club 62 (ours) or the same first name (same rule as the podium).
 */
export function ourMafgamePlayers(players, roster, clubId) {
  const byNick = new Map(roster.map((member) => [normalizeNick(member.nick), member]));
  return players.flatMap((player) => {
    const member = byNick.get(normalizeNick(player.nick));
    if (!member) return [];
    const firstName = member.name.split(" ")[0].toLowerCase();
    if (player.clubId !== clubId && !(firstName && player.name.toLowerCase().startsWith(firstName))) return [];
    return [{ nick: member.nick, imafiaId: member.imafiaId ?? null, status: player.status }];
  });
}

/** The roster players in an iMafia participant list, matched by iMafia id. */
export function ourImafiaPlayers(participants, roster) {
  const byId = new Map(roster.filter((m) => m.imafiaId).map((m) => [m.imafiaId, m]));
  return participants.flatMap((p) =>
    byId.has(p.id) ? [{ nick: byId.get(p.id).nick, imafiaId: p.id, status: p.status }] : [],
  );
}

// ---------- The saved file ----------

/** Stable order: by start, then end, source and title; players by nick. */
export function sortTournaments(tournaments) {
  for (const t of tournaments) t.players.sort((a, b) => a.nick.localeCompare(b.nick, "ru"));
  return tournaments.sort(
    (a, b) =>
      a.start.localeCompare(b.start) ||
      a.end.localeCompare(b.end) ||
      a.source.localeCompare(b.source) ||
      a.title.localeCompare(b.title, "ru") ||
      a.id.localeCompare(b.id),
  );
}
