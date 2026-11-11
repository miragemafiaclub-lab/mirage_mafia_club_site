import { useState } from "react";
import CalendarIcon from "./CalendarIcon";
import "./PlayerRoster.css";
import {
  CHK_BASE,
  KCHK_BASE,
  PLACEHOLDER_BIO,
  playerTitle,
  type RosterPlayer,
} from "../data/players";

type RosterGroup = {
  id: "chk" | "kchk";
  title: string;
  subtitle: string;
  description: string;
  players: RosterPlayer[];
};

const ROSTER_GROUPS: Record<"chk" | "kchk", RosterGroup> = {
  chk: {
    id: "chk",
    title: "Члены Клуба",
    subtitle: "Основной состав клуба",
    description:
      "ЧК — это ядро Mirage. Опытные игроки, которые представляют клуб на всех турнирах. Игроки клуба, которые вносят важный вклад в жизнь Mirage.",
    players: CHK_BASE,
  },
  kchk: {
    id: "kchk",
    title: "Кандидаты в Члены Клуба",
    subtitle: "Расширенный состав клуба",
    description:
      "КЧК — активные игроки клуба, которые создают атмосферу, развиваются и вносят важный вклад в жизнь Mirage.",
    players: KCHK_BASE,
  },
};

export default function PlayerRoster({
  groupId,
  onClose,
}: {
  groupId: "chk" | "kchk";
  onClose: () => void;
}) {
  const group = ROSTER_GROUPS[groupId];
  const [selected, setSelected] = useState<RosterPlayer | null>(null);

  return (
    <div className="roster">
      <div className="roster__intro">
        <button type="button" className="roster__back" onClick={onClose}>
          <span aria-hidden="true">←</span> Назад
        </button>

        <p className="roster__eyebrow">Players</p>
        <h1 className="roster__title">{group.title}</h1>
        <p className="roster__subtitle">{group.subtitle}</p>
        <p className="roster__lead">{group.description}</p>

        <div className="roster__footer">
          <p>Mirage Mafia Club</p>
          <p>Warsaw · Est. 2023</p>
        </div>
      </div>

      <div className={`roster__grid${selected ? " roster__grid--narrow" : ""}`}>
        {group.players.map((player) => (
          <button
            type="button"
            className="roster-card"
            key={player.nick}
            onClick={() => setSelected(player)}
          >
            <div className="roster-card__photo" aria-hidden="true">
              {player.photo ? <img src={player.photo} alt="" /> : <span>{player.nick.charAt(0)}</span>}
            </div>

            <div className="roster-card__body">
              <div className="roster-card__head">
                <div className="roster-card__who">
                  <p className="roster-card__nick">{player.nick}</p>
                  <p className="roster-card__name">{player.name || " "}</p>
                  {playerTitle(player) && <p className="roster-card__title">{playerTitle(player)}</p>}
                </div>
              </div>

              <div className="roster-card__foot">
                <p className="roster-card__joined">
                  В клубе с
                  <br />
                  <strong>{player.joinedAt}</strong>
                </p>
                <span className="roster-card__arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <aside className="roster__panel">
          <button type="button" className="roster__panel-close" onClick={() => setSelected(null)} aria-label="Закрыть профиль">
            ×
          </button>

          <div className="roster__panel-head">
            <div className="roster__panel-photo" aria-hidden="true">
              {selected.photo ? <img src={selected.photo} alt="" /> : <span>{selected.nick.charAt(0)}</span>}
            </div>

            <div>
              <h2>{selected.nick}</h2>
              <p className="roster__panel-name">{selected.name || " "}</p>
              {playerTitle(selected) && <span className="roster__panel-badge">{playerTitle(selected)}</span>}
            </div>
          </div>

          <p className="roster__panel-joined">
            <CalendarIcon />
            <span>
              В клубе с <strong>{selected.joinedAt}</strong>
            </span>
          </p>

          <div className="roster__panel-body">
            <h3>О себе</h3>
            {(selected.bio ?? [PLACEHOLDER_BIO]).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
