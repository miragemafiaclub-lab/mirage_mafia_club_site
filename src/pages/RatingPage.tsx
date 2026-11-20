import { Fragment, useEffect, useId, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { playerByImafiaId, thumbFor } from "../data/playerDirectory";
import { clubRecords, recordsSince } from "../data/records";
import { IMAFIA_CLUB_URL, unpackRating, type League, type RatingRow, type Season, type StoredRating } from "../data/rating";
import {
  basePoints,
  COLLAPSED_ROWS,
  extraPerGame,
  findRows,
  formatDate,
  formatNumber,
  formatSigned,
  isHiddenRow,
  leagueLabel,
  monthLabel,
  orderLeagues,
  pickSelection,
  placeChange,
  rankMetric,
  seasonLabel,
  visibleRows,
} from "../data/ratingView";
import { useHydrated } from "../hooks/useHydrated";
import { useLang, useT } from "../i18n/lang";
import { rating as dict, type ColumnId } from "../i18n/rating";
import { textLang } from "../i18n/translit";
import { usePageData } from "../pageDataCache";
import { localize, STATIC_PAGES } from "../routes";
import RatingPodium from "./RatingPodium";
import RowDetails from "./RatingRowDetails";
import "./rating.css";
import NoPhoto from "../components/NoPhoto";

/**
 * Numeric columns in table order, most important first. `show` is the narrowest screen that still has the
 * column (rating.css): phones keep the average and extras per game, tablets add games and wins, desktops all.
 * Everything is also in a row's details.
 */
const COLUMNS: { id: ColumnId; value: (row: RatingRow) => string; show: "phone" | "tablet" | "desktop"; main?: boolean }[] = [
  { id: "avg", value: (r) => formatNumber(r.avg), show: "phone", main: true },
  { id: "games", value: (r) => String(r.games), show: "tablet" },
  { id: "wins", value: (r) => String(r.wins), show: "tablet" },
  { id: "base", value: (r) => formatNumber(basePoints(r)), show: "desktop" },
  { id: "extra", value: (r) => formatSigned(r.extraSum), show: "desktop" },
  { id: "extraPerGame", value: (r) => formatSigned(extraPerGame(r), 2), show: "phone" },
  { id: "donWins", value: (r) => String(r.donWins), show: "desktop" },
  { id: "sheriffWins", value: (r) => String(r.sheriffWins), show: "desktop" },
];

const columnClass = (show: "phone" | "tablet" | "desktop") => (show === "phone" ? "" : ` is-${show}`);

/** Row element ids: the details panel and the row itself (for "find yourself"). */
const rowDomId = (id: string) => `rating-row-${id}`;
const detailsDomId = (id: string) => `rating-details-${id}`;

function Change({ row, season }: { row: RatingRow; season: Season }) {
  const t = useT(dict);
  const change = placeChange(row, season);
  if (!change) return null;
  if (change.kind === "new") return <span className="rating-change rating-change--new" title={t.newEntry} aria-label={t.newEntry}>•</span>;
  if (change.kind === "same") return <span className="rating-change rating-change--same" title={t.same} aria-label={t.same}>–</span>;
  const label = change.kind === "up" ? t.up(change.by) : t.down(change.by);
  return (
    <span className={`rating-change rating-change--${change.kind}`} title={label} aria-label={label}>
      {change.kind === "up" ? "▲" : "▼"}
      {change.by}
    </span>
  );
}

/** A 32px round photo, or the club's lion when there is none. Decorative: the nick is next to it. */
function Avatar({ id }: { id: string }) {
  const thumb = thumbFor(id);
  return (
    <span className="rating-avatar" aria-hidden="true">
      {thumb ? <img src={thumb} alt="" width={32} height={32} loading="lazy" decoding="async" /> : <NoPhoto />}
    </span>
  );
}

function PlayerName({ row, avatar = false }: { row: Pick<RatingRow, "id" | "nick">; avatar?: boolean }) {
  const { lang } = useLang();
  const player = playerByImafiaId(row.id);
  const nick = (
    <>
      {avatar && <Avatar id={row.id} />}
      <span className="rating-table__nick" lang={textLang(row.nick)}>
        {row.nick}
      </span>
    </>
  );
  return player ? (
    <Link className="rating-table__player" to={localize(`/players/${player.slug}`, lang)} title={row.nick}>
      {nick}
    </Link>
  ) : (
    <span className="rating-table__player is-plain" title={row.nick}>
      {nick}
    </span>
  );
}

export default function RatingPage() {
  const t = useT(dict);
  const { lang } = useLang();
  const { data, failed } = usePageData<StoredRating>("/data/rating.json");
  const leagues = useMemo(() => (data ? orderLeagues(unpackRating(data)) : null), [data]);

  return (
    <section className="rating">
      <header className="rating__intro">
        <p className="page__eyebrow">{t.eyebrow}</p>
        <h1 className="page__title">{t.title}</h1>
        <p className="page__lead">{t.lead}</p>
        <Link className="rating__tournaments" to={localize(STATIC_PAGES.tournaments, lang)}>
          {t.tournamentsLink} <span aria-hidden="true">→</span>
        </Link>
      </header>
      {leagues && data ? (
        <>
          <RatingTables leagues={leagues} updatedAt={data.updatedAt} />
          <ClubRecords leagues={leagues} />
        </>
      ) : (
        <p className="rating__empty" role="status">
          {failed ? t.loadFailed : t.loading}
        </p>
      )}
    </section>
  );
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function RatingTables({ leagues: LEAGUES, updatedAt }: { leagues: League[]; updatedAt: string }) {
  const t = useT(dict);
  const { lang } = useLang();
  const [params, setParams] = useSearchParams();
  // The prerendered page shows the default table; the address's choice applies once the page is live.
  const hydrated = useHydrated();
  const { league, season } = pickSelection(
    LEAGUES,
    hydrated ? { league: params.get("league"), season: params.get("season") } : {},
  );
  // Which table was opened with "Show all": another league or season starts collapsed again.
  // Collapsed in the prerendered HTML and on the first live render alike, so hydration matches.
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  // Rows opened or closed by hand, per table. A row nobody touched is open only if it is the one found.
  const [toggled, setToggled] = useState<Record<string, Record<string, boolean>>>({});
  const [query, setQuery] = useState("");
  // Which of several matches was picked; the best match otherwise.
  const [picked, setPicked] = useState<string | null>(null);
  // Bumped to scroll to the found row (on "Find", on picking a match, and once typing pauses).
  const [jump, setJump] = useState(0);
  const findId = useId();
  const findHintId = useId();
  const seasonId = useId();
  const tableKey = `${league.id}/${season.id}`;
  const leaguesRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  // Set by "Show all": the button goes away, so focus moves on to the first row it revealed.
  const focusRevealed = useRef(false);
  const [leagueEnds, setLeagueEnds] = useState({ start: true, end: false });

  const matches = findRows(season.rows, query);
  const found = matches.find((row) => row.id === picked) ?? matches[0] ?? null;
  const expanded = expandedTable === tableKey || (found !== null && isHiddenRow(season.rows, found));
  const { rows, hidden } = visibleRows(season.rows, { expanded });
  const isOpen = (row: RatingRow) => toggled[tableKey]?.[row.id] ?? row === found;
  const toggle = (row: RatingRow) =>
    setToggled((all) => ({ ...all, [tableKey]: { ...all[tableKey], [row.id]: !isOpen(row) } }));

  // Phones: the leagues are one swipeable row (rating.css). Its edges fade while there is more to
  // scroll that way, and the chosen league is brought into the row's view (without moving the page).
  useEffect(() => {
    const strip = leaguesRef.current;
    if (!strip) return;
    const measure = () =>
      setLeagueEnds({
        start: strip.scrollLeft <= 1,
        end: strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1,
      });
    measure();
    strip.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      strip.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const strip = leaguesRef.current;
    const tab = strip?.querySelector<HTMLElement>(".rating__league.is-active");
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    const left = tab.offsetLeft - strip.offsetLeft;
    const right = left + tab.offsetWidth;
    const pad = 24;
    let target = strip.scrollLeft;
    if (left - pad < strip.scrollLeft) target = left - pad;
    else if (right + pad > strip.scrollLeft + strip.clientWidth) target = right + pad - strip.clientWidth;
    if (target === strip.scrollLeft) return;
    strip.scrollTo({ left: Math.max(0, target), behavior: reducedMotion() ? "auto" : "smooth" });
  }, [league.id]);

  const select = (leagueId: string, nextSeasonId?: string) => {
    const next = pickSelection(LEAGUES, { league: leagueId, season: nextSeasonId });
    setParams({ league: next.league.id, ...(next.season.id && { season: next.season.id }) }, {
      replace: true,
      preventScrollReset: true,
    });
  };

  useEffect(() => {
    if (!focusRevealed.current) return;
    focusRevealed.current = false;
    const row = tableRef.current?.querySelectorAll<HTMLElement>("tbody tr.rating-table__row")[COLLAPSED_ROWS];
    row?.querySelector<HTMLElement>("a, button")?.focus();
  }, [expandedTable]);

  // Typing: once the nick stops changing for a moment, bring the found row into view (focus stays in the field).
  useEffect(() => {
    if (!query.trim()) return;
    const timer = window.setTimeout(() => setJump((n) => n + 1), 700);
    return () => window.clearTimeout(timer);
  }, [query]);

  const foundId = found?.id;
  useEffect(() => {
    if (!jump || !foundId) return;
    document.getElementById(rowDomId(foundId))?.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
  }, [jump, foundId]);

  // Arriving from "Find your place" (…/rating?league=…#find): the field is ready to type into. The table may have
  // loaded after the page did, so this runs here rather than relying on the browser's own jump to #find.
  useEffect(() => {
    if (window.location.hash !== "#find") return;
    document.getElementById("find")?.scrollIntoView({ block: "start" });
    document.getElementById(findId)?.focus({ preventScroll: true });
  }, [findId]);

  const onFind = (event: FormEvent) => {
    event.preventDefault();
    setJump((n) => n + 1);
  };

  // A click anywhere on a row opens it, except on the nick's link or the button itself.
  const onRowClick = (event: MouseEvent, row: RatingRow) => {
    if ((event.target as HTMLElement).closest("a, button")) return;
    toggle(row);
  };

  const firstUncounted = season.rows.find((row) => !row.counted);
  const updated = formatDate(updatedAt);
  const mvp = season.mvp[0] && season.rows.find((row) => row.id === season.mvp[0]);
  const metric = rankMetric(season);
  const columnCount = 3 + COLUMNS.length;

  return (
    <>
      <div className="rating__controls">
        <div
          className={`rating__leagues${leagueEnds.start ? "" : " is-scrolled"}${leagueEnds.end ? " is-end" : ""}`}
          role="group"
          aria-label={t.leagueLabel}
          ref={leaguesRef}
        >
          {LEAGUES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`rating__league${l.id === league.id ? " is-active" : ""}`}
              aria-pressed={l.id === league.id}
              onClick={() => select(l.id)}
            >
              {leagueLabel(l, lang)}
            </button>
          ))}
        </div>

        {league.seasons.length > 1 && (
          <div className="rating__field rating__field--season">
            <label htmlFor={seasonId}>{t.seasonLabel}</label>
            <select id={seasonId} value={season.id} onChange={(e) => select(league.id, e.target.value)}>
              {league.seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {seasonLabel(s, lang)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="rating__meta">
        <span>{seasonLabel(season, lang)}</span>
        {season.games > 0 && <span>{t.seasonGames(season.games)}</span>}
        {season.cutoff && <span>{t.countedFrom(season.cutoff.games)}</span>}
        {mvp && (
          <span>
            {t.mvp}: <PlayerName row={mvp} />
          </span>
        )}
        {updated && <span>{t.updated(updated)}</span>}
        <a href={IMAFIA_CLUB_URL} target="_blank" rel="noopener noreferrer">
          {t.source} <span aria-hidden="true">↗</span>
        </a>
      </p>

      <RatingPodium season={season} metric={metric} />

      {season.rows.length === 0 ? (
        <p className="rating__empty">{t.empty}</p>
      ) : (
        <section className="rating__board" aria-labelledby={`${findId}-title`}>
          <div className="rating__board-head">
            <h2 className="rating__board-title" id={`${findId}-title`}>
              {t.tableTitle}
            </h2>
            {metric && <p className="rating__board-note">{t.rankedBy[metric]}</p>}
          </div>

          <form className="rating-find" id="find" role="search" onSubmit={onFind}>
            <label className="rating-find__label" htmlFor={findId}>
              {t.find.label}
            </label>
            <div className="rating-find__field">
              <input
                id={findId}
                type="search"
                value={query}
                placeholder={t.find.placeholder}
                autoComplete="off"
                enterKeyHint="search"
                aria-describedby={findHintId}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPicked(null);
                }}
              />
              <button type="submit" className="rating-find__submit">
                {t.find.submit}
              </button>
            </div>
            <p className="rating-find__hint" id={findHintId} role="status">
              {query.trim() !== "" &&
                (found ? t.find.found(found.nick, found.place, found.counted) : t.find.notFound(query.trim()))}
            </p>
            {matches.length > 1 && (
              <div className="rating-find__more" role="group" aria-label={t.find.more}>
                <span aria-hidden="true">{t.find.more}</span>
                {matches.slice(0, 6).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`rating-find__match${m === found ? " is-active" : ""}`}
                    aria-pressed={m === found}
                    onClick={() => {
                      setPicked(m.id);
                      setJump((n) => n + 1);
                    }}
                  >
                    <span lang={textLang(m.nick)}>{m.nick}</span> · {m.place}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Above the table: the column abbreviations are read before the rows, not after a very long table. */}
          <details className="rating__legend">
            <summary>{t.legendTitle}</summary>
            <dl>
              {COLUMNS.map((c) => (
                <div key={c.id}>
                  <dt>{t.columns[c.id].short}</dt>
                  <dd>{t.columns[c.id].full}</dd>
                </div>
              ))}
            </dl>
            <p>
              {t.legendDetails}
              {season.hasHistory && ` ${t.legendArrows}`}
            </p>
          </details>

          <div className="rating-table__wrap rating-table__wrap--page">
            <table className="rating-table" ref={tableRef}>
              <caption className="visually-hidden">
                {leagueLabel(league, lang)} · {seasonLabel(season, lang)}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="rating-table__place">
                    <abbr title={t.place}>#</abbr>
                  </th>
                  <th scope="col" className="rating-table__name">
                    {t.player}
                  </th>
                  {COLUMNS.map((c) => (
                    <th key={c.id} scope="col" className={`rating-table__num${columnClass(c.show)}`}>
                      <abbr title={t.columns[c.id].full}>{t.columns[c.id].short}</abbr>
                    </th>
                  ))}
                  <th scope="col" className="rating-table__toggle">
                    <span className="visually-hidden">{t.details.column}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const open = isOpen(row);
                  return (
                    <Fragment key={row.id}>
                      {row === firstUncounted && season.cutoff && (
                        <tr className="rating-table__cutoff">
                          <td colSpan={columnCount}>{t.cutoff(season.cutoff.games, season.cutoff.percent)}</td>
                        </tr>
                      )}
                      <tr
                        id={rowDomId(row.id)}
                        className={[
                          "rating-table__row",
                          row.counted && row.place <= 3 ? `is-top is-top-${row.place}` : "",
                          row.counted ? "" : "is-uncounted",
                          open ? "is-open" : "",
                          row === found ? "is-found" : "",
                        ].join(" ")}
                        onClick={(e) => onRowClick(e, row)}
                      >
                        <td className="rating-table__place">
                          <span className="rating-table__place-n">{row.place}</span>
                          <Change row={row} season={season} />
                        </td>
                        <th scope="row" className="rating-table__name">
                          <PlayerName row={row} avatar />
                        </th>
                        {COLUMNS.map((c) => (
                          <td
                            key={c.id}
                            className={`rating-table__num${columnClass(c.show)}${c.main ? " rating-table__main" : ""}`}
                          >
                            {c.value(row)}
                          </td>
                        ))}
                        <td className="rating-table__toggle">
                          <button
                            type="button"
                            className="rating-table__toggle-btn"
                            aria-expanded={open}
                            aria-controls={open ? detailsDomId(row.id) : undefined}
                            aria-label={t.details.toggle(row.nick)}
                            onClick={() => toggle(row)}
                          >
                            <span className="rating-table__chevron" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                      {open && (
                        <tr className={`rating-table__details${row === found ? " is-found" : ""}`} id={detailsDomId(row.id)}>
                          <td colSpan={columnCount}>
                            <RowDetails row={row} season={season} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hidden > 0 && (
            <button
              type="button"
              className="rating__more"
              onClick={() => {
                focusRevealed.current = true;
                setExpandedTable(tableKey);
              }}
            >
              {t.showAll(season.rows.length)}
            </button>
          )}
        </section>
      )}
    </>
  );
}

/** The club's records over all monthly ratings: the same for every league and season, so outside the table's controls. */
function ClubRecords({ leagues }: { leagues: League[] }) {
  const t = useT(dict);
  const { lang } = useLang();
  const records = useMemo(() => clubRecords(leagues), [leagues]);
  const since = recordsSince(leagues);
  if (!records.length || !since) return null;

  return (
    <section className="records" aria-labelledby="records-title">
      <h2 className="records__title" id="records-title">
        {t.recordsTitle}
      </h2>
      <p className="records__lead">{t.recordsLead(`${t.monthsSince[since.month]} ${since.year}`)}</p>
      <ul className="records__grid">
        {records.map((record) => (
          <li className="records__card" key={record.id}>
            <h3 className="records__label">{t.records[record.id]}</h3>
            <p className="records__value">{record.id === "mvp" ? t.times(record.value) : formatNumber(record.value)}</p>
            <ul className="records__holders">
              {record.holders.map((holder) => (
                <li key={`${holder.id}-${holder.month}-${holder.year}`}>
                  <PlayerName row={holder} avatar />
                  {holder.month !== null && holder.year !== null && (
                    <span className="records__when">{monthLabel(holder.month, holder.year, lang)}</span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
