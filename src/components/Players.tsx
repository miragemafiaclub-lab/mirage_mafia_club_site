import { useEffect, useState, type CSSProperties } from "react";
import { useInView } from "../hooks/useInView";
import CalendarIcon from "./CalendarIcon";
import "./Players.css";
import {
  CHK_BASE,
  KCHK_BASE,
  PLACEHOLDER_BIO,
  playerTitle,
  type RosterPlayer,
} from "../data/players";

type Group = {
  id: "chk" | "kchk";
  shortTitle: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  players: RosterPlayer[];
};

const GROUPS: Group[] = [
  {
    id: "chk",
    shortTitle: "ЧК",
    title: "Члены Клуба",
    subtitle: "Основной состав клуба",
    description:
      "ЧК — это ядро Mirage. Опытные игроки, которые представляют клуб на всех турнирах. Игроки клуба, которые вносят важный вклад в жизнь Mirage.",
    ctaLabel: "Все игроки клуба",
    players: CHK_BASE,
  },
  {
    id: "kchk",
    shortTitle: "КЧК",
    title: "Кандидаты в Члены Клуба",
    subtitle: "Расширенный состав клуба",
    description:
      "КЧК — активные игроки клуба, которые создают атмосферу, развиваются и вносят важный вклад в жизнь Mirage.",
    ctaLabel: "Все игроки клуба",
    players: KCHK_BASE,
  },
];

// Which ends of the row the list has reached; the arrow that leads there is switched off.
type Ends = { start: boolean; end: boolean };

function rowEnds(row: HTMLElement): Ends {
  return {
    start: row.scrollLeft <= 1,
    end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 1,
  };
}

export default function Players({ onOpenRoster }: { onOpenRoster: (groupId: "chk" | "kchk") => void }) {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<RosterPlayer | null>(null);
  const group = GROUPS[active];
  const [gridRef, gridInView] = useInView<HTMLDivElement>(0.1);

  const [ends, setEnds] = useState<Ends>({ start: true, end: true });

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
          <p className="players__eyebrow">Players</p>

          <div className="players__tabs">
            {GROUPS.map((g, index) => (
              <button
                type="button"
                key={g.id}
                className={`players__tab${index === active ? " is-active" : ""}`}
                onClick={() => selectGroup(index)}
              >
                {g.shortTitle}
              </button>
            ))}
          </div>

          <h2 className="players__title">{group.title}</h2>
          <p className="players__subtitle">{group.subtitle}</p>
          <p className="players__lead">{group.description}</p>

          <button type="button" className="players__cta" onClick={() => onOpenRoster(group.id)}>
            {group.ctaLabel} <span aria-hidden="true">→</span>
          </button>

          <div className="players__footer">
            <p>Mirage Mafia Club</p>
            <p>Warsaw · Est. 2023</p>
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
                  onClick={() => setSelected(player)}
                >
                  <div className="players-card__photo" aria-hidden="true">
                    {player.photo ? <img src={player.photo} alt="" /> : <span>{player.nick.charAt(0)}</span>}
                  </div>

                  <div className="players-card__body">
                    <div className="players-card__head">
                      <div className="players-card__who">
                        <p className="players-card__nick">{player.nick}</p>
                        <p className="players-card__name">{player.name || " "}</p>
                        {playerTitle(player) && <p className="players-card__title">{playerTitle(player)}</p>}
                      </div>
                    </div>

                    <div className="players-card__foot">
                      <p className="players-card__joined">
                        В клубе с
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
                  aria-label="Предыдущие игроки"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="players__nav-btn"
                  onClick={() => step(1)}
                  disabled={ends.end}
                  aria-label="Следующие игроки"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {selected && (
            <aside className="players__panel">
              <button
                type="button"
                className="players__panel-close"
                onClick={() => setSelected(null)}
                aria-label="Закрыть профиль"
              >
                ×
              </button>

              <div className="players__panel-head">
                <div className="players__panel-photo" aria-hidden="true">
                  {selected.photo ? <img src={selected.photo} alt="" /> : <span>{selected.nick.charAt(0)}</span>}
                </div>

                <div>
                  <h3>{selected.nick}</h3>
                  <p className="players__panel-name">{selected.name || " "}</p>
                  {playerTitle(selected) && <span className="players__panel-badge">{playerTitle(selected)}</span>}
                </div>
              </div>

              <p className="players__panel-joined">
                <CalendarIcon />
                <span>
                  В клубе с <strong>{selected.joinedAt}</strong>
                </span>
              </p>

              <div className="players__panel-body">
                <h4>О себе</h4>
                {(selected.bio ?? [PLACEHOLDER_BIO]).map((paragraph, index) => (
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
