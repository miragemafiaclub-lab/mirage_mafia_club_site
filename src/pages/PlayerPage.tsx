import { Link } from "react-router";
import StoryCardButton from "../components/StoryCardButton";
import logo from "../assets/logo.jpeg";
import type { ClubPlayer } from "../data/playerDirectory";
import type { PlayerStats } from "../data/playerStats";
import { PLACEHOLDER_BIO, playerTitle } from "../data/players";
import { imafiaProfileUrl } from "../data/rating";
import { useLang, useT } from "../i18n/lang";
import { pages } from "../i18n/pages";
import { profile as profileDict } from "../i18n/profile";
import { players as playersDict } from "../i18n/players";
import { displayName, textLang } from "../i18n/translit";
import { usePageData } from "../pageDataCache";
import { pageDataUrl } from "../pageDataUrl";
import { useRoute, useSectionHref } from "../RouteContext";
import { localize } from "../routes";
import PlayerStatsView from "./PlayerStatsView";
import "./player-stats.css";

/** A player's own page. Rating places and stats come in slice 3. */
export default function PlayerPage({ player }: { player: ClubPlayer }) {
  const t = useT(pages).player;
  const groups = useT(playersDict).groups;
  const { lang } = useLang();
  const sectionHref = useSectionHref();
  const route = useRoute();
  const statsText = useT(profileDict);
  const { data: stats, failed } = usePageData<PlayerStats>(pageDataUrl(route));
  const isGuest = player.group === "guest";
  const title = playerTitle(player);
  const name = player.name ? displayName(player.name, lang) : "";
  // Guests never wrote a bio, and the roster placeholder is written as if by a club member.
  const bio = player.bio?.length ? player.bio : isGuest ? [] : [PLACEHOLDER_BIO[lang]];

  return (
    <article className="player-page">
      <Link className="page__back" to={sectionHref("players")}>
        <span aria-hidden="true">←</span> {t.back}
      </Link>

      <div className="player-page__layout">
        <div className="player-page__photo">
          {player.photo ? (
            <img src={player.photo} alt={t.photoAlt(player.nick)} width={480} height={640} />
          ) : (
            <img className="player-page__logo" src={logo} alt="" width={640} height={640} />
          )}
        </div>

        <div className="player-page__info">
          <p className="page__eyebrow">{player.group === "guest" ? t.guest : groups[player.group].title}</p>
          <h1 className="page__title player-page__nick" lang={textLang(player.nick)}>
            {player.nick}
          </h1>
          {name && <p className="player-page__name">{name}</p>}
          {title && <p className="player-page__rank">{title}</p>}

          {(player.joinedAt || player.imafiaId) && (
            <dl className="player-page__facts">
              {player.joinedAt && (
                <div>
                  <dt>{t.joined}</dt>
                  <dd>{player.joinedAt}</dd>
                </div>
              )}
              {player.imafiaId && (
                <div>
                  <dt>iMafia</dt>
                  <dd>
                    <a
                      className="player-page__link"
                      href={imafiaProfileUrl(player.imafiaId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.imafia} <span aria-hidden="true">↗</span>
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          )}

          {player.imafiaId && (
            <div className="page__actions player-page__actions">
              <StoryCardButton player={player} stats={stats} />
              <Link className="page__btn" to={`${localize("/compare", lang)}?a=${player.slug}`}>
                {statsText.compareWith} <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

          {player.imafiaId &&
            (stats ? (
              <PlayerStatsView stats={stats} player={player} />
            ) : (
              <p className="player-stats__note" role="status">
                {failed ? statsText.loadFailed : statsText.loading}
              </p>
            ))}

          {bio.length > 0 && (
            <>
              <h2 className="player-page__about">{t.about}</h2>
              <div className="player-page__bio" lang={player.bio?.length ? "ru" : lang}>
                {bio.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
