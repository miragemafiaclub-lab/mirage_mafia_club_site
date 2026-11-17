import { Fragment, useId, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { playerByImafiaId } from "../data/playerDirectory";
import { IMAFIA_CLUB_URL, LEAGUES, RATING_UPDATED_AT, type RatingRow, type Season } from "../data/rating";
import {
  filterRows,
  formatDate,
  formatNumber,
  leagueLabel,
  pickSelection,
  placeChange,
  seasonLabel,
} from "../data/ratingView";
import { useHydrated } from "../hooks/useHydrated";
import { useLang, useT } from "../i18n/lang";
import { rating as dict, type ColumnId } from "../i18n/rating";
import { textLang } from "../i18n/translit";
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

function PlayerName({ row }: { row: RatingRow }) {
  const { lang } = useLang();
  const player = playerByImafiaId(row.id);
  const nick = <span lang={textLang(row.nick)}>{row.nick}</span>;
  return player ? (
    <Link className="rating-table__player" to={localize(`/players/${player.slug}`, lang)}>
      {nick}
    </Link>
  ) : (
    nick
  );
}

export default function RatingPage() {
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
  const searchId = useId();
  const seasonId = useId();

  const select = (leagueId: string, nextSeasonId?: string) => {
    const next = pickSelection(LEAGUES, { league: leagueId, season: nextSeasonId });
    setParams({ league: next.league.id, ...(next.season.id && { season: next.season.id }) }, {
      replace: true,
      preventScrollReset: true,
    });
  };

  const rows = filterRows(season.rows, query);
  const firstUncounted = season.rows.find((row) => !row.counted);
  const updated = formatDate(RATING_UPDATED_AT);
  const mvp = season.mvp[0] && season.rows.find((row) => row.id === season.mvp[0]);

  return (
    <section className="rating">
      <p className="page__eyebrow">{t.eyebrow}</p>
      <h1 className="page__title">{t.title}</h1>
      <p className="page__lead">{t.lead}</p>

      <div className="rating__controls">
        <div className="rating__leagues" role="group" aria-label={t.leagueLabel}>
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

      {season.rows.length === 0 ? (
        <p className="rating__empty">{t.empty}</p>
      ) : rows.length === 0 ? (
        <p className="rating__empty" role="status">
          {t.nobody}
        </p>
      ) : (
        <div className="rating-table__wrap">
          <table className="rating-table">
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
                      <PlayerName row={row} />
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
        <p>{t.legendArrows}</p>
      </details>
    </section>
  );
}
