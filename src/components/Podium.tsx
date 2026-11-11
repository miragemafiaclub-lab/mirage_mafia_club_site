import { useRef, useState } from "react";
import {
  PODIUM_TOURNAMENTS,
  PODIUM_PERIOD,
  podiumFinishes,
  type PodiumFinish,
  type PodiumTournament,
} from "../data/podium";
import { useInView } from "../hooks/useInView";
import { useLang, useT, type Lang } from "../i18n/lang";
import { podiumText, type Forms } from "../i18n/podium";
import { textLang } from "../i18n/translit";
import "./Podium.css";

// Second, first, third: the classic podium order.
const STEPS = [2, 1, 3];

// The list opens with this many tournaments on a phone; Podium.css shows six on wider screens.
const COLLAPSED_PHONE = 4;
const COLLAPSED_WIDE = 6;

// Russian plural: "1 место", "3 места", "8 мест"; English: "1 place", "3 places".
function plural(count: number, forms: Forms, lang: Lang) {
  if (lang === "en") return count === 1 ? forms[0] : forms[1];
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

function counted(count: number, forms: Forms, lang: Lang) {
  return `${count} ${plural(count, forms, lang)}`;
}

function parseDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month: month - 1, day };
}

function formatDay(iso: string, months: string[]) {
  const { month, day } = parseDate(iso);
  return `${day} ${months[month]}`;
}

function formatRange(start: string, end: string, months: string[]) {
  if (start === end) return formatDay(start, months);
  const from = parseDate(start);
  const to = parseDate(end);
  if (from.month === to.month) return `${from.day}–${to.day} ${months[to.month]}`;
  return `${formatDay(start, months)} – ${formatDay(end, months)}`;
}

function Photo({ nick, photo, className }: { nick: string; photo?: string; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {photo ? <img src={photo} alt="" loading="lazy" /> : <span>{nick.charAt(0)}</span>}
    </span>
  );
}

// A cup silhouette that comes up behind the faces while the step is under the pointer (see Podium.css).
function Cup() {
  return (
    <span className="podium-step__cup" aria-hidden="true">
      <svg viewBox="0 0 120 140" preserveAspectRatio="xMidYMax meet" fill="currentColor">
        <path d="M26 6h68v14c0 30-12 50-28 56v18l12 16H42l12-16V76C38 70 26 50 26 20z" />
        <path
          d="M26 16H9v10c0 14 9 24 23 27M94 16h17v10c0 14-9 24-23 27"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
        />
        <path d="M34 110h52v12H34zM24 122h72v14H24z" />
      </svg>
    </span>
  );
}

type PrizeEntry = {
  place: number;
  team: string | null;
  tournament: PodiumTournament;
  players: { nick: string; photo?: string }[];
};

// One entry per prize place: teammates who shared it sit together, as "Sashko и Мёд".
function prizeEntries(finishes: PodiumFinish[]) {
  const entries: PrizeEntry[] = [];
  for (const finish of finishes) {
    const player = { nick: finish.nick, photo: finish.photo };
    const same = entries.find(
      (entry) =>
        entry.tournament === finish.tournament && entry.place === finish.place && entry.team === finish.team,
    );
    if (same) same.players.push(player);
    else entries.push({ place: finish.place, team: finish.team, tournament: finish.tournament, players: [player] });
  }
  return entries;
}

// Each player once, with how many times they appear: two wins put one face on the step, marked ×2.
function faces(finishes: PodiumFinish[]) {
  const seen = new Map<string, { nick: string; photo?: string; count: number }>();
  for (const finish of finishes) {
    const face = seen.get(finish.nick);
    if (face) face.count += 1;
    else seen.set(finish.nick, { nick: finish.nick, photo: finish.photo, count: 1 });
  }
  return [...seen.values()];
}

function ProtocolEvent({ tournament, entries }: { tournament: PodiumTournament; entries: PrizeEntry[] }) {
  const { lang } = useLang();
  const t = podiumText[lang];
  const facts = [
    formatRange(tournament.start, tournament.end, t.monthsAfterDay),
    tournament.location,
    t.formats[tournament.format],
    counted(tournament.players, t.players, lang),
  ];

  // By place; on the same place the personal standing comes before the team one.
  const rows = [...entries].sort(
    (x, y) => x.place - y.place || Number(Boolean(x.team)) - Number(Boolean(y.team)),
  );

  return (
    <article className="protocol__event">
      <h4 className="protocol__title">
        <a href={tournament.url} target="_blank" rel="noreferrer">
          {tournament.title}
        </a>
      </h4>
      <p className="protocol__facts">{facts.filter(Boolean).join(" · ")}</p>

      <ol className="protocol__rows">
        {rows.map((entry) => (
          <li
            className="protocol__row"
            key={`${entry.place}-${entry.team ?? entry.players.map((player) => player.nick).join()}`}
          >
            <span className={`protocol__place protocol__place--${entry.place}`} aria-label={t.placeLabel(entry.place)}>
              {entry.place}
            </span>
            <span className="protocol__photos">
              {entry.players.map((player) => (
                <Photo nick={player.nick} photo={player.photo} className="protocol__photo" key={player.nick} />
              ))}
            </span>
            <span className="protocol__who">
              <span className="protocol__nick">{entry.players.map((player) => player.nick).join(` ${t.and} `)}</span>
              {/* Only a team place is marked: a personal one is the default. */}
              {entry.team && (
                <span className="protocol__team">
                  {entry.players.length > 1 ? t.team : t.inTeam} {entry.team}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function Protocol({ tournaments, entries }: { tournaments: PodiumTournament[]; entries: PrizeEntry[] }) {
  const { lang } = useLang();
  const t = podiumText[lang];
  const [open, setOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);

  function toggle() {
    setOpen(!open);
    if (!open) return;
    // Collapsing shortens the page above the button and carries it off screen: bring it back.
    requestAnimationFrame(() => {
      const button = moreRef.current;
      if (!button) return;
      const { top, bottom } = button.getBoundingClientRect();
      if (top < 0 || bottom > window.innerHeight) button.scrollIntoView({ block: "center" });
    });
  }

  return (
    <div className="protocol">
      <h3 className="protocol__heading">{t.heading}</h3>

      <div className={`protocol__events${open ? " is-open" : ""}`} id="podium-tournaments">
        {tournaments.map((tournament) => (
          <ProtocolEvent
            tournament={tournament}
            entries={entries.filter((entry) => entry.tournament === tournament)}
            key={tournament.url}
          />
        ))}
      </div>

      {tournaments.length > COLLAPSED_PHONE && (
        <button
          type="button"
          className={`protocol__more${tournaments.length > COLLAPSED_WIDE ? "" : " protocol__more--phone"}`}
          aria-expanded={open}
          aria-controls="podium-tournaments"
          onClick={toggle}
          ref={moreRef}
        >
          {open ? t.collapse : t.showAll(counted(tournaments.length, t.tournaments, lang))}
        </button>
      )}
    </div>
  );
}

export default function Podium() {
  const { lang } = useLang();
  const t = useT(podiumText);
  const [stageRef, stageInView] = useInView<HTMLDivElement>(0.3);
  const finishes = podiumFinishes();
  const entries = prizeEntries(finishes);
  const prizeTournaments = PODIUM_TOURNAMENTS.filter((tournament) =>
    entries.some((entry) => entry.tournament === tournament),
  );
  const medalists = new Set(finishes.map((finish) => finish.nick));

  const stats = [
    { value: prizeTournaments.length, label: t.stats.tournaments },
    { value: medalists.size, label: t.stats.medalists },
    { value: finishes.length, label: t.stats.places },
  ];

  return (
    <section className="podium" id="podium">
      <div className="podium__layout">
        <div className="podium__intro">
          <p className="podium__eyebrow">{t.eyebrow}</p>
          <h2 className="podium__title">{t.title}</h2>
          <p className="podium__subtitle">
            {formatRange(PODIUM_PERIOD.start, PODIUM_PERIOD.end, t.monthsAfterDay)} {parseDate(PODIUM_PERIOD.end).year}
          </p>
          <p className="podium__lead">{t.lead}</p>

          <dl className="podium__stats">
            {stats.map((stat) => (
              <div className="podium__stat" key={stat.label}>
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="podium__main">
          {finishes.length === 0 ? (
            <p className="podium__empty">{t.empty}</p>
          ) : (
            <div className={`podium-stage${stageInView ? " is-in" : ""}`} ref={stageRef}>
              {STEPS.map((place) => {
                const placed = finishes.filter((finish) => finish.place === place);
                return (
                  <div className={`podium-step podium-step--${place}`} key={place}>
                    <Cup />
                    <ul className="podium-step__faces" aria-label={t.placeLabel(place)}>
                      {faces(placed).map(({ nick, photo, count }) => (
                        <li className="podium-face" key={nick}>
                          <Photo nick={nick} photo={photo} className="podium-face__photo" />
                          {count > 1 && <span className="podium-face__count">×{count}</span>}
                          <span className="podium-face__nick" lang={textLang(nick)}>{nick}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="podium-step__block">
                      <span className="podium-step__number">{place}</span>
                      <span className="podium-step__label">{counted(placed.length, t.place, lang)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {prizeTournaments.length > 0 && <Protocol tournaments={prizeTournaments} entries={entries} />}
    </section>
  );
}
