import { useEffect, useState } from "react";
import { Link } from "react-router";
import MonthlyChart, { type MonthBar } from "../components/MonthlyChart";
import type { ClubPlayer } from "../data/playerDirectory";
import { latestMonthPlace, type PlayerPlace, type PlayerStats } from "../data/playerStats";
import { DEFAULT_LEAGUE_NAME, formatDate, formatNumber } from "../data/ratingView";
import { awardName } from "../i18n/awards";
import { useLang, useT, type Lang } from "../i18n/lang";
import { profile as dict } from "../i18n/profile";
import { rating as ratingDict } from "../i18n/rating";
import { localize } from "../routes";
import MonthCard from "./MonthCard";

const ROLE_ORDER = ["don", "mafia", "civilian", "sheriff"] as const;
/** Prize places shown before "show all". */
const PRIZES_SHOWN = 8;
/** Fewer months than this read better as a line of text than as a near-empty chart. */
const CHART_MIN_MONTHS = 3;

function leagueName(place: PlayerPlace, lang: Lang) {
  const t = ratingDict[lang];
  const year = place.leagueName.match(/^Годовой рейтинг IMafia (\d{4})$/)?.[1];
  return year ? t.annual(year) : (t.leagueNames[place.leagueName] ?? place.leagueName);
}

function seasonName(place: PlayerPlace, lang: Lang) {
  const t = ratingDict[lang];
  if (place.month !== null && place.year !== null) return `${t.months[place.month]} ${place.year}`;
  if (!place.seasonName) return t.allTime;
  return /^Годовой рейтинг/.test(place.seasonName) ? "—" : t.season(place.seasonName);
}

function ratingHref(place: PlayerPlace, lang: Lang) {
  const query = new URLSearchParams({ league: place.leagueId, ...(place.seasonId && { season: place.seasonId }) });
  return `${localize("/rating", lang)}?${query}`;
}

/** The numbers part of a profile: club places, roles, monthly chart, every rating, prize places, awards. */
export default function PlayerStatsView({ stats, player }: { stats: PlayerStats; player: ClubPlayer }) {
  const monthPlace = latestMonthPlace(stats);
  const t = useT(dict);
  const { lang } = useLang();
  const months = ratingDict[lang].months;
  const annual = stats.places.find((p) => DEFAULT_LEAGUE_NAME.test(p.leagueName));
  const lastMonth = stats.places.find((p) => p.month !== null);
  const profile = stats.profile;
  const [showAllPrizes, setShowAllPrizes] = useState(false);
  const hasRoles =
    !!profile && profile.roles.don.games + profile.roles.mafia.games + profile.roles.civilian.games + profile.roles.sheriff.games > 0;

  // Arriving from a rating row (…/players/<slug>#roles): the stats load after the page, so the browser's own jump misses.
  useEffect(() => {
    if (hasRoles && window.location.hash === "#roles") document.getElementById("roles")?.scrollIntoView({ block: "start" });
  }, [hasRoles]);

  const bars: MonthBar[] = stats.monthly.map((m) => ({
    label: months[m.month].slice(0, 3),
    fullLabel: `${months[m.month]} ${m.year}`,
    points: m.points,
    place: m.place,
    counted: m.counted,
  }));
  const chartTip = (bar: MonthBar) => t.chartTip(bar.fullLabel, formatNumber(bar.points), bar.place, bar.counted);

  return (
    <div className="player-stats">
      {(annual || lastMonth || stats.mvpMonths > 0 || profile?.winRate != null) && (
        <dl className="player-stats__tiles">
          {annual && (
            <div className="player-stats__tile">
              <dt>{t.annualPlace}</dt>
              <dd>
                <Link to={ratingHref(annual, lang)}>№{annual.place}</Link> <span>{t.of(annual.of)}</span>
              </dd>
            </div>
          )}
          {lastMonth && lastMonth.month !== null && (
            <div className="player-stats__tile">
              <dt>{t.monthPlace(months[lastMonth.month])}</dt>
              <dd>
                <Link to={ratingHref(lastMonth, lang)}>№{lastMonth.place}</Link> <span>{t.of(lastMonth.of)}</span>
              </dd>
            </div>
          )}
          {annual && (
            <>
              <div className="player-stats__tile">
                <dt>{t.games}</dt>
                <dd>{annual.games}</dd>
              </div>
              <div className="player-stats__tile">
                <dt>{t.wins}</dt>
                <dd>{annual.wins}</dd>
              </div>
            </>
          )}
          {profile?.winRate != null && (
            <div className="player-stats__tile">
              <dt>{t.winRate}</dt>
              <dd>{formatNumber(profile.winRate)}%</dd>
            </div>
          )}
          {stats.mvpMonths > 0 && (
            <div className="player-stats__tile">
              <dt>{t.mvp}</dt>
              <dd>×{stats.mvpMonths}</dd>
            </div>
          )}
        </dl>
      )}

      {profile && hasRoles && (
        <section className="player-stats__block" id="roles" aria-labelledby="roles-title">
          <h2 className="player-page__about" id="roles-title">
            {t.rolesTitle}
          </h2>
          <ul className="player-stats__roles">
            {ROLE_ORDER.map((role) => {
              const r = profile.roles[role];
              const pct = r.games ? (r.wins / r.games) * 100 : 0;
              return (
                <li key={role} className={`player-stats__role player-stats__role--${role}`}>
                  <span className="player-stats__role-name">{t.roles[role]}</span>
                  <span className="player-stats__role-bar" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <span className="player-stats__role-value">
                    <strong>{formatNumber(Math.round(pct * 10) / 10)}%</strong> {t.roleLine(r.wins, r.games)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="player-stats__note">
            {t.rolesNote}
            {profile.firstBlood != null && ` ${t.firstBlood}: ${formatNumber(profile.firstBlood)}%.`}
          </p>
        </section>
      )}

      {bars.length > 0 && (
        <section className="player-stats__block" aria-labelledby="chart-title">
          <h2 className="player-page__about" id="chart-title">
            {t.chartTitle}
          </h2>
          {bars.length < CHART_MIN_MONTHS ? (
            <p className="player-stats__months">{bars.map(chartTip).join(" · ")}</p>
          ) : (
            <MonthlyChart bars={bars} caption={t.chartTitle} tooltip={chartTip} />
          )}
        </section>
      )}

      {stats.places.length > 0 && (
        <section className="player-stats__block" aria-labelledby="places-title">
          <h2 className="player-page__about" id="places-title">
            {t.placesTitle}
          </h2>
          <div className={`player-stats__places-grid${monthPlace ? " has-card" : ""}`}>
          {monthPlace && <MonthCard player={player} place={monthPlace} />}
          {/* Phones: each row becomes a small card (player-stats.css), so nothing hides past the right edge. */}
          <div className="rating-table__wrap player-stats__places-wrap">
            <table className="rating-table player-stats__places">
              <thead>
                <tr>
                  <th scope="col">{t.league}</th>
                  <th scope="col">{t.season}</th>
                  <th scope="col" className="rating-table__num">
                    {t.place}
                  </th>
                  <th scope="col" className="rating-table__num">
                    {t.points}
                  </th>
                  <th scope="col" className="rating-table__num is-narrow">
                    <abbr title={ratingDict[lang].columns.avg.full}>{ratingDict[lang].columns.avg.short}</abbr>
                  </th>
                  <th scope="col" className="rating-table__num is-narrow">
                    <abbr title={ratingDict[lang].columns.games.full}>{ratingDict[lang].columns.games.short}</abbr>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.places.map((p) => (
                  <tr key={`${p.leagueId}/${p.seasonId}`}>
                    <td className="player-stats__league">{leagueName(p, lang)}</td>
                    <td className="player-stats__season">{seasonName(p, lang)}</td>
                    <td
                      className={`rating-table__num player-stats__place${p.counted && p.place <= 3 ? ` player-stats__podium is-top-${p.place}` : ""}`}
                    >
                      {/* The whole "3 / 25" is the link, padded to a 44px target. */}
                      <Link className="rating-table__player player-stats__place-link" to={ratingHref(p, lang)}>
                        {p.place}
                        <span className="player-stats__of">&nbsp;/ {p.of}</span>
                      </Link>
                    </td>
                    <td className="rating-table__num player-stats__points" data-label={t.points}>
                      {formatNumber(p.points)}
                    </td>
                    <td className="rating-table__num is-narrow">{formatNumber(p.avg)}</td>
                    <td className="rating-table__num is-narrow">{p.games}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}

      {profile && (
        <section className="player-stats__block" aria-labelledby="prizes-title">
          <h2 className="player-page__about" id="prizes-title">
            {t.prizesTitle}
          </h2>
          {profile.prizes.length > 0 ? (
            <ul className="player-stats__prizes">
              {(showAllPrizes ? profile.prizes : profile.prizes.slice(0, PRIZES_SHOWN)).map((prize) => (
                <li key={prize.id} className={`player-stats__prize is-top-${prize.place}`}>
                  <span className="player-stats__medal" aria-label={t.medal(prize.place)}>
                    {prize.place}
                  </span>
                  <a href={`https://imafia.org/tournament/${prize.id}`} target="_blank" rel="noopener noreferrer">
                    {prize.name}
                  </a>
                  <span className="player-stats__prize-meta">
                    {formatDate(`${prize.date}T12:00:00Z`)}
                    {prize.players ? ` · ${t.players(prize.players)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="player-stats__note">{t.prizesNone}</p>
          )}
          {profile.prizes.length > PRIZES_SHOWN && (
            <button type="button" className="page__btn player-stats__more" onClick={() => setShowAllPrizes((v) => !v)}>
              {showAllPrizes ? t.showFewer : t.showAll(profile.prizes.length)}
            </button>
          )}
          <p className="player-stats__note">
            {t.prizesNote(profile.tournaments)} {t.updated(formatDate(profile.fetchedAt))}
          </p>
        </section>
      )}

      {profile && profile.awards.length > 0 && (
        <section className="player-stats__block" aria-labelledby="awards-title">
          <h2 className="player-page__about" id="awards-title">
            {t.awardsTitle}
          </h2>
          <ul className="player-stats__awards">
            {profile.awards.map((award) => {
              const name = awardName(award.name, lang);
              return (
                <li key={`${award.year}-${award.name}`}>
                  <strong>{award.year}</strong> <span lang={name.lang}>{name.text}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!profile && <p className="player-stats__note">{t.noStats}</p>}
    </div>
  );
}
