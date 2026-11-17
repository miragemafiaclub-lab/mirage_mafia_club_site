import { Link } from "react-router";
import logo from "../assets/logo.jpeg";
import type { ClubPlayer } from "../data/playerDirectory";
import { PLACEHOLDER_BIO, playerTitle } from "../data/players";
import { useLang, useT } from "../i18n/lang";
import { pages } from "../i18n/pages";
import { players as playersDict } from "../i18n/players";
import { displayName, textLang } from "../i18n/translit";
import { useSectionHref } from "../RouteContext";

/** A player's own page. Slice 1: what the roster already knows; rating and stats come in slices 2–3. */
export default function PlayerPage({ player }: { player: ClubPlayer }) {
  const t = useT(pages).player;
  const group = useT(playersDict).groups[player.group];
  const { lang } = useLang();
  const sectionHref = useSectionHref();
  const title = playerTitle(player);
  const name = displayName(player.name, lang);
  const bio = player.bio?.length ? player.bio : [PLACEHOLDER_BIO[lang]];

  return (
    <article className="player-page">
      <Link className="page__back" to={sectionHref("players")}>
        <span aria-hidden="true">←</span> {t.back}
      </Link>

      <div className="player-page__layout">
        <div className="player-page__photo">
          {player.photo ? (
            <img src={player.photo} alt={t.photoAlt(player.nick)} />
          ) : (
            <img className="player-page__logo" src={logo} alt="" />
          )}
        </div>

        <div className="player-page__info">
          <p className="page__eyebrow">{group.title}</p>
          <h1 className="page__title player-page__nick" lang={textLang(player.nick)}>
            {player.nick}
          </h1>
          {name && <p className="player-page__name">{name}</p>}
          {title && <p className="player-page__rank">{title}</p>}

          <dl className="player-page__facts">
            <div>
              <dt>{t.joined}</dt>
              <dd>{player.joinedAt}</dd>
            </div>
          </dl>

          <h2 className="player-page__about">{t.about}</h2>
          <div className="player-page__bio" lang={player.bio?.length ? "ru" : lang}>
            {bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
