import { useRef, useState } from "react";
import {
  PODIUM_TOURNAMENTS,
  PODIUM_PERIOD,
  playerPhoto,
  podiumFinishes,
  type PodiumFinish,
  type PodiumTournament,
  type TournamentFormat,
} from "../data/podium";
import { useInView } from "../hooks/useInView";
import "./Podium.css";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  single: "личный",
  team: "командный",
  series: "этап серии",
};

// Second, first, third: the classic podium order.
const STEPS = [2, 1, 3];

// The list opens with this many tournaments on a phone; Podium.css shows six on wider screens.
const COLLAPSED_PHONE = 4;
const COLLAPSED_WIDE = 6;

type Forms = [one: string, few: string, many: string];

const PLACES: Forms = ["место", "места", "мест"];
const TOURNAMENTS: Forms = ["турнир", "турнира", "турниров"];
const PLAYERS: Forms = ["игрок", "игрока", "игроков"];

// Russian plural: "1 место", "3 места", "8 мест".
function plural(count: number, forms: Forms) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

function counted(count: number, forms: Forms) {
  return `${count} ${plural(count, forms)}`;
}

function parseDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month: month - 1, day };
}

function formatDay(iso: string) {
  const { month, day } = parseDate(iso);
  return `${day} ${MONTHS_GENITIVE[month]}`;
}

function formatRange(start: string, end: string) {
  if (start === end) return formatDay(start);
  const from = parseDate(start);
  const to = parseDate(end);
  if (from.month === to.month) return `${from.day}–${to.day} ${MONTHS_GENITIVE[to.month]}`;
  return `${formatDay(start)} – ${formatDay(end)}`;
}

function Photo({ nick, className }: { nick: string; className: string }) {
  const photo = playerPhoto(nick);
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

type PrizeEntry = { place: number; team: string | null; tournament: PodiumTournament; nicks: string[] };

// One entry per prize place: teammates who shared it sit together, as "Sashko и Мёд".
function prizeEntries(finishes: PodiumFinish[]) {
  const entries: PrizeEntry[] = [];
  for (const finish of finishes) {
    const same = entries.find(
      (entry) =>
        entry.tournament === finish.tournament && entry.place === finish.place && entry.team === finish.team,
    );
    if (same) same.nicks.push(finish.nick);
    else entries.push({ place: finish.place, team: finish.team, tournament: finish.tournament, nicks: [finish.nick] });
  }
  return entries;
}

// Each player once, with how many times they appear: two wins put one face on the step, marked ×2.
function faces(finishes: PodiumFinish[]) {
  const counts = new Map<string, number>();
  for (const finish of finishes) counts.set(finish.nick, (counts.get(finish.nick) ?? 0) + 1);
  return [...counts];
}

function ProtocolEvent({ tournament, entries }: { tournament: PodiumTournament; entries: PrizeEntry[] }) {
  const facts = [
    formatRange(tournament.start, tournament.end),
    tournament.location,
    FORMAT_LABELS[tournament.format],
    counted(tournament.players, PLAYERS),
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
          <li className="protocol__row" key={`${entry.place}-${entry.team ?? entry.nicks.join()}`}>
            <span className={`protocol__place protocol__place--${entry.place}`} aria-label={`${entry.place} место`}>
              {entry.place}
            </span>
            <span className="protocol__photos">
              {entry.nicks.map((nick) => (
                <Photo nick={nick} className="protocol__photo" key={nick} />
              ))}
            </span>
            <span className="protocol__who">
              <span className="protocol__nick">{entry.nicks.join(" и ")}</span>
              {/* Only a team place is marked: a personal one is the default. */}
              {entry.team && (
                <span className="protocol__team">
                  {entry.nicks.length > 1 ? "команда" : "в команде"} {entry.team}
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
      <h3 className="protocol__heading">Турниры</h3>

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
          {open ? "Свернуть" : `Показать все ${counted(tournaments.length, TOURNAMENTS)}`}
        </button>
      )}
    </div>
  );
}

export default function Podium() {
  const [stageRef, stageInView] = useInView<HTMLDivElement>(0.3);
  const finishes = podiumFinishes();
  const entries = prizeEntries(finishes);
  const prizeTournaments = PODIUM_TOURNAMENTS.filter((tournament) =>
    entries.some((entry) => entry.tournament === tournament),
  );
  const medalists = new Set(finishes.map((finish) => finish.nick));

  const stats = [
    { value: prizeTournaments.length, label: "Турниров" },
    { value: medalists.size, label: "Призёров" },
    { value: finishes.length, label: "Призовых мест" },
  ];

  return (
    <section className="podium" id="podium">
      <div className="podium__layout">
        <div className="podium__intro">
          <p className="podium__eyebrow">Podium</p>
          <h2 className="podium__title">Пьедестал победителей</h2>
          <p className="podium__subtitle">
            {formatRange(PODIUM_PERIOD.start, PODIUM_PERIOD.end)} {parseDate(PODIUM_PERIOD.end).year}
          </p>
          <p className="podium__lead">
            Игроки Mirage, которые заняли призовые места на турнирах за последние две недели. Результаты с
            iMafia и MafGame, обновляются раз в две недели.
          </p>

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
            <p className="podium__empty">За эти две недели без призовых мест. Ждём следующих турниров!</p>
          ) : (
            <div className={`podium-stage${stageInView ? " is-in" : ""}`} ref={stageRef}>
              {STEPS.map((place) => {
                const placed = finishes.filter((finish) => finish.place === place);
                return (
                  <div className={`podium-step podium-step--${place}`} key={place}>
                    <Cup />
                    <ul className="podium-step__faces" aria-label={`${place} место`}>
                      {faces(placed).map(([nick, count]) => (
                        <li className="podium-face" key={nick}>
                          <Photo nick={nick} className="podium-face__photo" />
                          {count > 1 && <span className="podium-face__count">×{count}</span>}
                          <span className="podium-face__nick">{nick}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="podium-step__block">
                      <span className="podium-step__number">{place}</span>
                      <span className="podium-step__label">{counted(placed.length, PLACES)}</span>
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
