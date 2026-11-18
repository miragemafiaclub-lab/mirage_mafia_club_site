import { Link } from "react-router";
import logo from "../assets/logo.jpeg";
import type { ClubPlayer } from "../data/playerDirectory";
import type { PlayerPlace } from "../data/playerStats";
import { formatNumber, formatSigned, winRate } from "../data/ratingView";
import { useLang, useT } from "../i18n/lang";
import { profile as dict } from "../i18n/profile";
import { rating as ratingDict } from "../i18n/rating";
import { textLang } from "../i18n/translit";
import { localize } from "../routes";

/**
 * "Card of the month": the player's line in the newest monthly rating they played in, as a trading card —
 * photo, place, average, and six numbers. The whole card opens that month's table.
 */
export default function MonthCard({ player, place }: { player: ClubPlayer; place: PlayerPlace }) {
  const t = useT(dict).card;
  const { lang } = useLang();
  const month = `${ratingDict[lang].months[place.month!]} ${place.year}`;
  const medal = place.counted && place.place <= 3 ? ` is-top-${place.place}` : "";
  const href = `${localize("/rating", lang)}?${new URLSearchParams({ league: place.leagueId, season: place.seasonId })}`;
  const attrs = [
    { label: t.games, value: String(place.games) },
    { label: t.wins, value: String(place.wins) },
    { label: t.winRate, value: `${Math.round(winRate(place))}%` },
    { label: t.extraPerGame, value: formatSigned(place.games ? place.extraSum / place.games : 0, 2) },
    { label: t.don, value: String(place.donWins) },
    { label: t.sheriff, value: String(place.sheriffWins) },
  ];

  return (
    <Link className={`month-card${medal}`} to={href} title={t.open}>
      <span className="month-card__photo">
        <img src={player.photo ?? logo} alt="" width={480} height={360} loading="lazy" decoding="async" />
      </span>
      <span className="month-card__rank">
        {place.place}
        <span className="visually-hidden"> {t.place(place.place)}</span>
      </span>
      <span className="month-card__avg">
        <b>{formatNumber(place.avg)}</b>
        <span>{t.avg}</span>
      </span>
      <span className="month-card__body">
        <span className="month-card__label">
          {t.label(month)} · {t.of(place.of)}
          {!place.counted && ` · ${t.uncounted}`}
        </span>
        <span className="month-card__nick" lang={textLang(player.nick)}>
          {player.nick}
        </span>
        <span className="month-card__attrs">
          {attrs.map((attr) => (
            <span key={attr.label} className="month-card__attr">
              <b>{attr.value}</b>
              <span>{attr.label}</span>
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}
