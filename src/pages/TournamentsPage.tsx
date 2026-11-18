import { Link, useSearchParams } from "react-router";
import logo from "../assets/logo.jpeg";
import {
  dateBadge,
  DEFAULT_FILTER,
  FILTERS,
  filterTournaments,
  formatDateRange,
  formatDay,
  parseFilter,
  playerPage,
  TOURNAMENTS,
  TOURNAMENTS_UPDATED,
  type Tournament,
  type TournamentFilter,
  type TournamentPlayer,
} from "../data/tournaments";
import { useHydrated } from "../hooks/useHydrated";
import { useLang, useT } from "../i18n/lang";
import { tournaments as dict } from "../i18n/tournaments";
import { textLang } from "../i18n/translit";
import { localize } from "../routes";
import "./tournaments.css";

const LISTS = [
  { href: "https://imafia.org/tournaments", key: "imafiaList" },
  { href: "https://mafgame.org/tournaments", key: "mafgameList" },
] as const;

function Place({ tournament }: { tournament: Tournament }) {
  const t = useT(dict);
  if (tournament.kind === "online") return <>{t.online}</>;
  const parts = [tournament.city, tournament.country && t.country(tournament.country)].filter(Boolean);
  return <>{parts.length ? parts.join(", ") : t.placeUnknown}</>;
}

function Player({ player }: { player: TournamentPlayer }) {
  const t = useT(dict);
  const { lang } = useLang();
  const page = playerPage(player);
  const applied = player.status === "applied" && (
    <span className="tournament__applied" title={t.appliedTitle}>
      {t.applied}
    </span>
  );
  const body = (
    <>
      <img className="tournament__avatar" src={page?.photo ?? logo} alt="" width={28} height={28} loading="lazy" decoding="async" />
      <span lang={textLang(player.nick)}>{player.nick}</span>
      {applied}
    </>
  );
  return (
    <li>
      {page ? (
        <Link className="tournament__player" to={localize(`/players/${page.slug}`, lang)}>
          {body}
        </Link>
      ) : (
        <span className="tournament__player">{body}</span>
      )}
    </li>
  );
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const t = useT(dict);
  const { lang } = useLang();
  const badge = dateBadge(tournament.start, tournament.end, lang);
  return (
    <li>
      <article className={`tournament tournament--${tournament.kind}`} aria-labelledby={`t-${tournament.id}`}>
        <p className="tournament__date" aria-hidden="true">
          <span className="tournament__day">{badge.day}</span>
          <span className="tournament__month">{badge.month}</span>
        </p>
        <div className="tournament__body">
          <h2 className="tournament__title" id={`t-${tournament.id}`} lang={textLang(tournament.title)}>
            {tournament.title}
          </h2>
          <p className="tournament__meta">
            <time dateTime={tournament.start}>{formatDateRange(tournament.start, tournament.end, lang)}</time>
            <span className="tournament__dot" aria-hidden="true">
              ·
            </span>
            <span className={tournament.kind === "online" ? "tournament__online" : undefined}>
              <Place tournament={tournament} />
            </span>
          </p>
          <div className="tournament__players">
            <h3 className="tournament__players-title">{t.players}</h3>
            <ul>
              {tournament.players.map((player) => (
                <Player key={player.nick} player={player} />
              ))}
            </ul>
          </div>
        </div>
        <a
          className="tournament__source"
          href={tournament.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.openOnLabel(tournament.title, tournament.source)}
        >
          {t.openOn(tournament.source)} <span aria-hidden="true">↗</span>
        </a>
      </article>
    </li>
  );
}

export default function TournamentsPage() {
  const t = useT(dict);
  const { lang } = useLang();
  const [params, setParams] = useSearchParams();
  // The prerendered page shows the default filter; the address's choice applies once the page is live.
  const hydrated = useHydrated();
  const filter = hydrated ? parseFilter(params.get("f")) : DEFAULT_FILTER;
  const shown = filterTournaments(TOURNAMENTS, filter);

  const select = (next: TournamentFilter) => {
    const nextParams = new URLSearchParams(params);
    if (next === DEFAULT_FILTER) nextParams.delete("f");
    else nextParams.set("f", next);
    setParams(nextParams, { replace: true, preventScrollReset: true });
  };

  return (
    <section className="tournaments">
      <header className="tournaments__intro">
        <p className="page__eyebrow">{t.eyebrow}</p>
        <h1 className="page__title">{t.title}</h1>
        <p className="page__lead">{t.lead}</p>
      </header>

      <div className="tournaments__bar">
        <div className="tournaments__filters" role="group" aria-label={t.filtersLabel}>
          {FILTERS.map((id) => (
            <button
              key={id}
              type="button"
              className={`tournaments__filter${id === filter ? " is-active" : ""}`}
              aria-pressed={id === filter}
              onClick={() => select(id)}
            >
              {t.filters[id]}
              <span className="tournaments__count">{filterTournaments(TOURNAMENTS, id).length}</span>
            </button>
          ))}
        </div>
        {TOURNAMENTS_UPDATED && (
          <p className="tournaments__updated">
            <time dateTime={TOURNAMENTS_UPDATED}>{t.updated(formatDay(TOURNAMENTS_UPDATED, lang))}</time>
          </p>
        )}
      </div>

      {shown.length > 0 ? (
        <ol className="tournaments__list" aria-label={t.listLabel(t.filters[filter])}>
          {shown.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </ol>
      ) : (
        <div className="tournaments__empty" role="status">
          <p>{t.empty[filter]}</p>
          <p className="tournaments__empty-hint">{t.emptyHint}</p>
          <ul className="tournaments__lists">
            {LISTS.map((list) => (
              <li key={list.href}>
                <a className="page__btn" href={list.href} target="_blank" rel="noopener noreferrer">
                  {t[list.key]} <span aria-hidden="true">↗</span>
                  <span className="visually-hidden">{t.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="tournaments__note">{t.note}</p>
    </section>
  );
}
