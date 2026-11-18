import { Link } from "react-router";
import { playerByImafiaId, thumbFor } from "../data/playerDirectory";
import type { League, RatingRow } from "../data/rating";
import { formatNumber, leagueLabel, pickSelection } from "../data/ratingView";
import { useLang, useT } from "../i18n/lang";
import { ratingLeaders as dict } from "../i18n/ratingLeaders";
import { textLang } from "../i18n/translit";
import { localize } from "../routes";
import "./rating-leaders.css";

function Portrait({ row }: { row: RatingRow }) {
  const player = playerByImafiaId(row.id);
  // The profile photo when there is one; the small table thumb otherwise; the first letter as a last resort.
  const src = player?.photo ?? thumbFor(row.id);
  return (
    <span className="leaders__photo" aria-hidden="true">
      {src ? <img src={src} alt="" width={168} height={168} decoding="async" /> : [...row.nick][0]?.toUpperCase()}
    </span>
  );
}

/**
 * The default table's top three as a podium (2 · 1 · 3 on screen, 1 · 2 · 3 for screen readers). Always the
 * default table, not the one picked below: the same in the prerendered HTML and once the page is live.
 */
export default function RatingLeaders({ leagues }: { leagues: League[] }) {
  const t = useT(dict);
  const { lang } = useLang();
  const { league, season } = pickSelection(leagues, {});
  const top = season.rows
    .filter((row) => row.counted && row.place <= 3)
    .sort((a, b) => a.place - b.place)
    .slice(0, 3);
  if (top.length < 3) return null;

  return (
    <figure className="leaders">
      <figcaption className="leaders__caption">
        {t.title} · {leagueLabel(league, lang)}
      </figcaption>
      <ol className="leaders__list">
        {top.map((row) => {
          const player = playerByImafiaId(row.id);
          const body = (
            <>
              <Portrait row={row} />
              <span className="leaders__place">
                <span aria-hidden="true">{row.place}</span>
                <span className="visually-hidden">{t.place(row.place)}:</span>
              </span>
              <span className="leaders__nick" lang={textLang(row.nick)}>
                {row.nick}
              </span>
              <span className="leaders__points">{t.points(formatNumber(row.avg), formatNumber(row.points))}</span>
            </>
          );
          return (
            <li key={row.id} className={`leaders__item is-place-${row.place}`}>
              {player ? (
                <Link className="leaders__link" to={localize(`/players/${player.slug}`, lang)}>
                  {body}
                </Link>
              ) : (
                <span className="leaders__link">{body}</span>
              )}
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
