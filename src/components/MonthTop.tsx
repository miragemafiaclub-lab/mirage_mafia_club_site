import { Link } from "react-router";
import { playerByImafiaId, thumbFor } from "../data/playerDirectory";
import type { MonthTop as MonthTopData } from "../data/ratingView";
import { useInView } from "../hooks/useInView";
import { useLang, useT } from "../i18n/lang";
import { monthTop as dict } from "../i18n/monthTop";
import { textLang } from "../i18n/translit";
import { usePageData } from "../pageDataCache";
import { MONTH_TOP_URL } from "../pageDataUrl";
import { localize } from "../routes";
import "./MonthTop.css";
import NoPhoto from "./NoPhoto";

// Numbers as iMafia writes them (2.28, 11); the rating's own helper would bring the whole rating view along.
const format = (value: number) => String(Math.round(value * 100) / 100);

/**
 * "Best players of <month>": the top five of the latest monthly rating with counted players, worked out at build
 * time (src/server/pageData.ts), so the home page carries a few hundred bytes instead of the whole rating.
 */
export default function MonthTop() {
  const t = useT(dict);
  const { lang } = useLang();
  const { data } = usePageData<MonthTopData | null>(MONTH_TOP_URL);
  const [listRef, inView] = useInView<HTMLOListElement>(0.2);
  if (!data || data.rows.length === 0) return null;

  const monthName = `${t.months[data.month]} ${data.year}`;
  const query = new URLSearchParams({ league: data.leagueId, season: data.seasonId });
  const ratingHref = localize("/rating", lang);

  return (
    <section className="month-top" id="month-top" aria-labelledby="month-top-title">
      <div className="month-top__layout">
        <div className="month-top__intro">
          <p className="month-top__eyebrow">{t.eyebrow(monthName)}</p>
          <h2 className="month-top__title" id="month-top-title">
            {t.title(t.monthsOf[data.month])}
          </h2>
          <p className="month-top__lead">
            {data.metric === "points" ? t.rankedByPoints : data.metric === "avg" ? t.rankedByAvg : ""}
            {data.cutoffGames ? ` ${t.counted(data.cutoffGames)}` : ""}
          </p>
          <div className="month-top__actions">
            <Link className="month-top__btn month-top__btn--primary" to={`${ratingHref}?${query}#find`}>
              {t.find} <span aria-hidden="true">→</span>
            </Link>
            <Link className="month-top__btn" to={ratingHref}>
              {t.all}
            </Link>
          </div>
        </div>

        <ol className={`month-top__list${inView ? " is-in" : ""}`} ref={listRef} aria-label={t.listLabel(monthName)}>
          {data.rows.map((row, index) => {
            const player = playerByImafiaId(row.id);
            const photo = player?.photo ?? thumbFor(row.id);
            const body = (
              <>
                <span className="month-top__place">
                  <span aria-hidden="true">{row.place}</span>
                  <span className="visually-hidden">{t.place(row.place)}:</span>
                </span>
                <span className="month-top__photo" aria-hidden="true">
                  {photo ? <img src={photo} alt="" width={44} height={44} loading="lazy" decoding="async" /> : <NoPhoto />}
                </span>
                <span className="month-top__who">
                  <span className="month-top__nick" lang={textLang(row.nick)}>
                    {row.nick}
                  </span>
                  <span className="month-top__sub">{t.gamesWins(row.games, row.wins)}</span>
                </span>
                <span className="month-top__value">
                  {data.metric === "points" ? format(row.points) : format(row.avg)}
                  <small>{data.metric === "points" ? t.points : t.perGame}</small>
                </span>
              </>
            );
            return (
              <li
                key={row.id}
                className={`month-top__item${row.place <= 3 ? ` is-top-${row.place}` : ""}`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                {player ? (
                  <Link className="month-top__row" to={localize(`/players/${player.slug}`, lang)}>
                    {body}
                  </Link>
                ) : (
                  <span className="month-top__row">{body}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
