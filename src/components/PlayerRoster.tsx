import { useEffect, useRef } from "react";
import { Link } from "react-router";
import "./PlayerRoster.css";
import { useLang, useT } from "../i18n/lang";
import { displayName } from "../i18n/translit";
import { players as playersDict } from "../i18n/players";
import { rosterPlayer } from "../data/playerDirectory";
import { CHK_BASE, KCHK_BASE, playerTitle, type RosterPlayer } from "../data/players";
import { localize } from "../routes";

type GroupId = "chk" | "kchk";

const ROSTER_PLAYERS: Record<GroupId, RosterPlayer[]> = {
  chk: CHK_BASE,
  kchk: KCHK_BASE,
};

/**
 * Full-page list of a group's players. Behaves like a dialog over the main page:
 * focus starts on the heading, Esc and the browser Back button close it, and on close
 * focus returns to the "All players" button (`[data-roster-open]` in Players.tsx).
 */
export default function PlayerRoster({
  groupId,
  onClose,
}: {
  groupId: GroupId;
  onClose: () => void;
}) {
  const t = useT(playersDict);
  const { lang } = useLang();
  const copy = t.groups[groupId];
  const players = ROSTER_PLAYERS[groupId];

  const headingRef = useRef<HTMLHeadingElement>(null);
  // True while our history entry is the current one. A ref, so React StrictMode's
  // second mount in dev does not push a second entry.
  const pushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Once the main page has rendered again, give focus back to the button that opened the roster.
  // A close from popstate renders asynchronously, so look for the button for a few frames.
  function finishClose() {
    onCloseRef.current();
    let frames = 10;
    const refocus = () => {
      const opener =
        document.querySelector<HTMLElement>(`[data-roster-open="${groupId}"]`) ??
        document.querySelector<HTMLElement>("[data-roster-open]");
      if (opener) opener.focus({ preventScroll: true });
      else if (--frames > 0) requestAnimationFrame(refocus);
    };
    requestAnimationFrame(refocus);
  }

  // Closing with the on-page button or Esc also removes our history entry,
  // so the browser Back button does not have to be pressed twice.
  function close() {
    if (pushedRef.current) {
      pushedRef.current = false;
      if ((history.state as { roster?: boolean } | null)?.roster) history.back();
    }
    finishClose();
  }

  // Browser Back closes the roster.
  useEffect(() => {
    if (!pushedRef.current) {
      history.pushState({ roster: true }, "");
      pushedRef.current = true;
    }
    function onPopState() {
      // Our own history.back() from close(): already handled.
      if (!pushedRef.current) return;
      pushedRef.current = false;
      finishClose();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // Mount only: finishClose reads the latest onClose through a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Screen readers announce the new page; keyboard users start from its top.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc closes the roster.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="roster">
      <div className="roster__intro">
        <button type="button" className="roster__back" onClick={close}>
          <span aria-hidden="true">←</span> {t.back}
        </button>

        <p className="roster__eyebrow">{t.eyebrow}</p>
        <h1 className="roster__title" ref={headingRef} tabIndex={-1}>
          {copy.title}
        </h1>
        <p className="roster__subtitle">{copy.subtitle}</p>
        <p className="roster__lead">{copy.description}</p>

        <div className="roster__footer">
          <p>Mirage Mafia Club</p>
          <p>{t.footerCity}</p>
        </div>
      </div>

      <div className="roster__grid">
        {players.map((player) => (
          // replace: the profile takes the roster's own history entry, so Back returns to the home page.
          <Link
            className="roster-card"
            key={player.nick}
            to={localize(`/players/${rosterPlayer(player.nick)?.slug ?? ""}`, lang)}
            replace
          >
            <div className="roster-card__photo" aria-hidden="true">
              {player.photo ? <img src={player.photo} alt="" loading="lazy" decoding="async" /> : <span>{player.nick.charAt(0)}</span>}
            </div>

            <div className="roster-card__body">
              <div className="roster-card__head">
                <div className="roster-card__who">
                  <p className="roster-card__nick">{player.nick}</p>
                  <p className="roster-card__name">{displayName(player.name, lang) || " "}</p>
                  {playerTitle(player) && <p className="roster-card__title">{playerTitle(player)}</p>}
                </div>
              </div>

              <div className="roster-card__foot">
                <p className="roster-card__joined">
                  {t.joined}
                  <br />
                  <strong>{player.joinedAt}</strong>
                </p>
                <span className="roster-card__arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
