import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { playerByImafiaId, thumbFor } from "../data/playerDirectory";
import { clubRecords, recordsSince } from "../data/records";
import { IMAFIA_CLUB_URL, unpackRating, type League, type RatingRow, type Season, type StoredRating } from "../data/rating";
import {
  filterRows,
  formatDate,
  formatNumber,
  leagueLabel,
  monthLabel,
  pickSelection,
  placeChange,
  COLLAPSED_ROWS,
  seasonLabel,
  visibleRows,
} from "../data/ratingView";
import { useHydrated } from "../hooks/useHydrated";
import { useLang, useT } from "../i18n/lang";
import { rating as dict, type ColumnId } from "../i18n/rating";
import { textLang } from "../i18n/translit";
import { usePageData } from "../pageDataCache";
import { localize } from "../routes";
import "./rating.css";

/** Numeric columns in table order; the narrow ones are hidden on phones (see rating.css). */
const COLUMNS: { id: ColumnId; value: (row: RatingRow) => number; narrow?: boolean }[] = [
  { id: "games", value: (r) => r.games },
  { id: "points", value: (r) => r.points },
  { id: "avg", value: (r) => r.avg },
  { id: "extra", value: (r) => r.extraSum, narrow: true },
  { id: "wins", value: (r) => r.wins },
  { id: "donWins", value: (r) => r.donWins, narrow: true },
  { id: "sheriffWins", value: (r) => r.sheriffWins, narrow: true },
  { id: "firstKilled", value: (r) => r.firstKilled, narrow: true },
  { id: "ci", value: (r) => r.ci, narrow: true },
];

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

/** A 32px round photo, or the nick's first letter when there is none. Decorative: the nick is next to it. */
export function Avatar({ id, nick }: { id: string; nick: string }) {
  const thumb = thumbFor(id);
  return (
    <span className="rating-avatar" aria-hidden="true">
      {thumb ? <img src={thumb} alt="" width={32} height={32} loading="lazy" decoding="async" /> : [...nick][0]?.toUpperCase()}
    </span>
  );
}

function PlayerName({ row, avatar = false }: { row: Pick<RatingRow, "id" | "nick">; avatar?: boolean }) {
  const { lang } = useLang();
  const player = playerByImafiaId(row.id);
  const nick = (
    <>
      {avatar && <Avatar id={row.id} nick={row.nick} />}
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
  const { data, failed } = usePageData<StoredRating>("/data/rating.json");
  const leagues = useMemo(() => (data ? unpackRating(data) : null), [data]);

  return (
    <section className="rating">
      <p className="page__eyebrow">{t.eyebrow}</p>
      <h1 className="page__title">{t.title}</h1>
      <p className="page__lead">{t.lead}</p>
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
  const [query, setQuery] = useState("");
  // Which table was opened with "Show all": another league or season starts collapsed again.
  // Collapsed in the prerendered HTML and on the first live render alike, so hydration matches.
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const searchId = useId();
  const seasonId = useId();
  const tableKey = `${league.id}/${season.id}`;
  const leaguesRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  // Set by "Show all": the button goes away, so focus moves on to the first row it revealed.
  const focusRevealed = useRef(false);
  const [leagueEnds, setLeagueEnds] = useState({ start: true, end: false });

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
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollTo({ left: Math.max(0, target), behavior: still ? "auto" : "smooth" });
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
    const row = tableRef.current?.querySelectorAll<HTMLElement>("tbody tr:not(.rating-table__cutoff)")[COLLAPSED_ROWS];
    const target = row?.querySelector<HTMLElement>("a") ?? row?.querySelector<HTMLElement>("th");
    if (!target) return;
    if (target.tagName !== "A") target.tabIndex = -1;
    target.focus();
  }, [expandedTable]);

  const matches = filterRows(season.rows, query);
  const { rows, hidden } = visibleRows(matches, {
    searching: query.trim() !== "",
    expanded: expandedTable === tableKey,
  });
  const firstUncounted = season.rows.find((row) => !row.counted);
  const updated = formatDate(updatedAt);
  const mvp = season.mvp[0] && season.rows.find((row) => row.id === season.mvp[0]);

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

        <div className="rating__filters">
          {league.seasons.length > 1 && (
            <div className="rating__field">
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
          <div className="rating__field rating__field--search">
            <label htmlFor={searchId}>{t.searchLabel}</label>
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <p className="rating__meta">
        <span>{seasonLabel(season, lang)}</span>
        {season.games > 0 && <span>{t.seasonGames(season.games)}</span>}
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

      {/* Above the table, open: the column abbreviations are read before the rows, not after a very long table. */}
      {season.rows.length > 0 && (
        <details className="rating__legend" open>
          <summary>{t.legendTitle}</summary>
          <dl>
            {COLUMNS.map((c) => (
              <div key={c.id} className={c.narrow ? "is-narrow" : undefined}>
                <dt>{t.columns[c.id].short}</dt>
                <dd>{t.columns[c.id].full}</dd>
              </div>
            ))}
          </dl>
          {season.hasHistory && <p>{t.legendArrows}</p>}
        </details>
      )}

      {season.rows.length === 0 ? (
        <p className="rating__empty">{t.empty}</p>
      ) : matches.length === 0 ? (
        <p className="rating__empty" role="status">
          {t.nobody}
        </p>
      ) : (
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
                {season.hasHistory && (
                  <th scope="col" className="rating-table__change">
                    <span className="visually-hidden">{t.change}</span>
                  </th>
                )}
                <th scope="col" className="rating-table__name">
                  {t.player}
                </th>
                {COLUMNS.map((c) => (
                  <th key={c.id} scope="col" className={`rating-table__num${c.narrow ? " is-narrow" : ""}`}>
                    <abbr title={t.columns[c.id].full}>{t.columns[c.id].short}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  {row === firstUncounted && season.cutoff && !query && (
                    <tr className="rating-table__cutoff">
                      <td colSpan={(season.hasHistory ? 3 : 2) + COLUMNS.length}>{t.cutoff(season.cutoff.games, season.cutoff.percent)}</td>
                    </tr>
                  )}
                  <tr
                    className={[
                      row.counted && row.place <= 3 ? `is-top is-top-${row.place}` : "",
                      row.counted ? "" : "is-uncounted",
                    ].join(" ")}
                  >
                    <td className="rating-table__place">{row.place}</td>
                    {season.hasHistory && (
                      <td className="rating-table__change">
                        <Change row={row} season={season} />
                      </td>
                    )}
                    <th scope="row" className="rating-table__name">
                      <PlayerName row={row} avatar />
                    </th>
                    {COLUMNS.map((c) => (
                      <td
                        key={c.id}
                        className={`rating-table__num${c.narrow ? " is-narrow" : ""}`}
                        title={
                          c.id === "extra"
                            ? `${t.extraParts.plus} ${formatNumber(row.extraPlus)} · ${t.extraParts.minus} ${formatNumber(row.extraMinus)} · ${t.extraParts.discipline} ${formatNumber(row.discipline)} · ${t.extraParts.bestMoves} ${formatNumber(row.bestMoves)}`
                            : undefined
                        }
                      >
                        {formatNumber(c.value(row))}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hidden > 0 && (
        <button type="button" className="rating__more" onClick={() => {
            focusRevealed.current = true;
            setExpandedTable(tableKey);
          }}>
          {t.showAll(matches.length)}
        </button>
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
