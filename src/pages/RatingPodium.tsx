import { Link } from "react-router";
import { playerByImafiaId, thumbFor } from "../data/playerDirectory";
import type { RatingRow, Season } from "../data/rating";
import { formatNumber, podiumRows, winRate, type RankMetric } from "../data/ratingView";
import { useLang, useT } from "../i18n/lang";
import { rating as dict } from "../i18n/rating";
import { textLang } from "../i18n/translit";
import { localize } from "../routes";
import NoPhoto from "../components/NoPhoto";
import MemberBadge from "../components/MemberBadge";

/** The profile photo when there is one; the small table thumb otherwise; the club's lion as a last resort. */
export function PlayerPhoto({ id, size, className }: { id: string; size: number; className: string }) {
  const src = playerByImafiaId(id)?.photo ?? thumbFor(id);
  return (
    <span className={className} aria-hidden="true">
      {src ? <img src={src} alt="" width={size} height={size} decoding="async" /> : <NoPhoto />}
    </span>
  );
}

/**
 * The shown table's top three (counted rows) as a podium: 2 · 1 · 3 on wide screens, 1 on top of 2 · 3 on phones,
 * 1 · 2 · 3 for screen readers. The big number is what the places follow (average, or points where iMafia sorts by them).
 */
export default function RatingPodium({ season, metric }: { season: Season; metric: RankMetric | null }) {
  const t = useT(dict);
  const { lang } = useLang();
  const top = podiumRows(season);
  if (top.length < 3) return null;

  const body = (row: RatingRow) => (
    <>
      <span className="podium-card__place">
        <span aria-hidden="true">{row.place}</span>
        <span className="visually-hidden">{t.podium.place(row.place)}:</span>
      </span>
      <PlayerPhoto id={row.id} size={160} className="podium-card__photo" />
      <span className="podium-card__nick" lang={textLang(row.nick)}>
        {row.nick}
        <MemberBadge id={row.id} />
      </span>
      <span className="podium-card__score">
        {metric === "points" ? formatNumber(row.points) : formatNumber(row.avg)}
        <small>{metric === "points" ? t.podium.points : t.podium.perGame}</small>
      </span>
      <span className="podium-card__chips">
        <span className="podium-card__chip">{t.podium.games(row.games)}</span>
        <span className="podium-card__chip">{t.podium.wins(row.wins)}</span>
        <span className="podium-card__chip">
          {Math.round(winRate(row))}% <span className="visually-hidden">{t.podium.winRate}</span>
        </span>
      </span>
    </>
  );

  return (
    <section className="podium-top" aria-label={t.podium.title}>
      <ol className="podium-top__list">
        {top.map((row) => {
          const player = playerByImafiaId(row.id);
          return (
            <li key={row.id} className={`podium-card is-place-${row.place}`}>
              {player ? (
                <Link className="podium-card__link" to={localize(`/players/${player.slug}`, lang)}>
                  {body(row)}
                </Link>
              ) : (
                <span className="podium-card__link">{body(row)}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
