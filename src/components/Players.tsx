import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView } from "../hooks/useInView";
import CalendarIcon from "./CalendarIcon";
import "./Players.css";
import { useLang, useT } from "../i18n/lang";
import { displayName } from "../i18n/translit";
import { players as playersDict } from "../i18n/players";
import {
  CHK_BASE,
  KCHK_BASE,
  PLACEHOLDER_BIO,
  playerTitle,
  type RosterPlayer,
} from "../data/players";

type GroupId = "chk" | "kchk";

const GROUPS: { id: GroupId; players: RosterPlayer[] }[] = [
  { id: "chk", players: CHK_BASE },
  { id: "kchk", players: KCHK_BASE },
];

const PANEL_ID = "players-profile";

// Which ends of the row the list has reached; the arrow that leads there is switched off.
type Ends = { start: boolean; end: boolean };

function rowEnds(row: HTMLElement): Ends {
  return {
    start: row.scrollLeft <= 1,
    end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 1,
  };
}

export default function Players({ onOpenRoster }: { onOpenRoster: (groupId: GroupId) => void }) {
  const t = useT(playersDict);
  const { lang } = useLang();
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<RosterPlayer | null>(null);
  const group = GROUPS[active];
  const copy = t.groups[group.id];
  // The card that opened the profile gets focus back when the profile closes.
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [gridRef, gridInView] = useInView<HTMLDivElement>(0.1);

  const [ends, setEnds] = useState<Ends>({ start: true, end: true });

  function openProfile(player: RosterPlayer, card: HTMLButtonElement) {
    openerRef.current = card;
    setSelected(player);
  }

  function closeProfile() {
    setSelected(null);
    openerRef.current?.focus();
  }

  function selectGroup(index: number) {
    setActive(index);
    setSelected(null);
  }

  // The arrows move the row by as many cards as fit on screen.
  function step(towards: 1 | -1) {
    const grid = gridRef.current;
    const card = grid?.querySelector<HTMLElement>(".players-card");
    if (!grid || !card) return;
    const style = getComputedStyle(grid);
    const pitch = card.offsetWidth + parseFloat(style.columnGap);
    const visible = grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const cards = Math.max(1, Math.floor((visible + parseFloat(style.columnGap) + 1) / pitch));
    grid.scrollBy({
      left: towards * cards * pitch,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  // Another group starts from its first card. The row gets narrower when the profile opens
  // and wider when the window does, so the ends are measured again after every such change.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.scrollLeft = 0;
    const sync = () => {
      const now = rowEnds(grid);
      setEnds((ends) => (ends.start === now.start && ends.end === now.end ? ends : now));
    };
    grid.addEventListener("scroll", sync, { passive: true });
    // Reports once straight away, which covers the first measurement.
    const watch = new ResizeObserver(sync);
    watch.observe(grid);
    return () => {
      grid.removeEventListener("scroll", sync);
      watch.disconnect();
    };
  }, [active, gridRef]);

  // The row gets narrower when the profile opens: keep the chosen card in view.
  const selectedNick = selected?.nick;
  useEffect(() => {
    if (!selectedNick) return;
    // Keyboard and screen reader users land on the profile they just opened.
    panelRef.current?.focus();
    const grid = gridRef.current;
    const card = grid?.querySelector<HTMLElement>(".players-card.is-active");
    if (!grid || !card) return;
    const gridBox = grid.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    if (cardBox.left < gridBox.left || cardBox.right > gridBox.right) {
      grid.scrollLeft += cardBox.left - gridBox.left - parseFloat(getComputedStyle(grid).paddingLeft);
    }
  }, [selectedNick, gridRef]);

  return (
    <section className="players" id="players">
      <div className="players__layout">
        <div className="players__intro">
          <p className="players__eyebrow">{t.eyebrow}</p>

          <div className="players__tabs" role="group" aria-label={t.tabsLabel}>
            {GROUPS.map((g, index) => (
              <button
                type="button"
                key={g.id}
                className={`players__tab${index === active ? " is-active" : ""}`}
                aria-pressed={index === active}
                onClick={() => selectGroup(index)}
              >
                {t.groups[g.id].shortTitle}
              </button>
            ))}
          </div>

          <h2 className="players__title">{copy.title}</h2>
          <p className="players__subtitle">{copy.subtitle}</p>
          <p className="players__lead">{copy.description}</p>

          {/* PlayerRoster returns focus here on close, found by this attribute. */}
          <button
            type="button"
            className="players__cta"
            data-roster-open={group.id}
            onClick={() => onOpenRoster(group.id)}
          >
            {t.ctaLabel} <span aria-hidden="true">→</span>
          </button>

          <div className="players__footer">
            <p>Mirage Mafia Club</p>
            <p>{t.footerCity}</p>
          </div>
        </div>

        <div className="players__main">
          <div className="players__list">
            <div className={`players__grid${gridInView ? " is-in" : ""}`} ref={gridRef}>
              {group.players.map((player, index) => (
                <button
                  type="button"
                  className={`players-card${selected?.nick === player.nick ? " is-active" : ""}`}
                  style={{ "--i": index } as CSSProperties}
                  key={player.nick}
                  aria-expanded={selected?.nick === player.nick}
                  aria-controls={PANEL_ID}
                  onClick={(event) => openProfile(player, event.currentTarget)}
                >
                  <div className="players-card__photo" aria-hidden="true">
                    {player.photo ? <img src={player.photo} alt="" loading="lazy" decoding="async" /> : <span>{player.nick.charAt(0)}</span>}
                  </div>

                  <div className="players-card__body">
                    <div className="players-card__head">
                      <div className="players-card__who">
                        <p className="players-card__nick">{player.nick}</p>
                        <p className="players-card__name">{displayName(player.name, lang) || " "}</p>
                        {playerTitle(player) && <p className="players-card__title">{playerTitle(player)}</p>}
                      </div>
                    </div>

                    <div className="players-card__foot">
                      <p className="players-card__joined">
                        {t.joined}
                        <br />
                        <strong>{player.joinedAt}</strong>
                      </p>
                      <span className="players-card__arrow" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {!(ends.start && ends.end) && (
              <div className="players__nav">
                <button
                  type="button"
                  className="players__nav-btn"
                  onClick={() => step(-1)}
                  disabled={ends.start}
                  aria-label={t.prevPlayers}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="players__nav-btn"
                  onClick={() => step(1)}
                  disabled={ends.end}
                  aria-label={t.nextPlayers}
                >
                  →
                </button>
              </div>
            )}
          </div>

          {selected && (
            <aside
              className="players__panel"
              id={PANEL_ID}
              ref={panelRef}
              tabIndex={-1}
              aria-labelledby={`${PANEL_ID}-nick`}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeProfile();
              }}
            >
              <button
                type="button"
                className="players__panel-close"
                onClick={closeProfile}
                aria-label={t.closeProfile}
              >
                ×
              </button>

              <div className="players__panel-head">
                <div className="players__panel-photo" aria-hidden="true">
                  {selected.photo ? <img src={selected.photo} alt="" loading="lazy" decoding="async" /> : <span>{selected.nick.charAt(0)}</span>}
                </div>

                <div>
                  <h3 id={`${PANEL_ID}-nick`}>{selected.nick}</h3>
                  <p className="players__panel-name">{displayName(selected.name, lang) || " "}</p>
                  {playerTitle(selected) && <span className="players__panel-badge">{playerTitle(selected)}</span>}
                </div>
              </div>

              <p className="players__panel-joined">
                <CalendarIcon />
                <span>
                  {t.joined} <strong>{selected.joinedAt}</strong>
                </span>
              </p>

              <div className="players__panel-body">
                <h4>{t.about}</h4>
                {(selected.bio ?? [PLACEHOLDER_BIO[lang]]).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
