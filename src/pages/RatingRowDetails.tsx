import { Link } from "react-router";
import { playerByImafiaId } from "../data/playerDirectory";
import type { RatingRow, Season } from "../data/rating";
import {
  basePoints,
  extraPerGame,
  formatNumber,
  formatSigned,
  otherRoleWins,
  standing,
  winRate,
  type Standing,
} from "../data/ratingView";
import { useLang, useT } from "../i18n/lang";
import { rating as dict } from "../i18n/rating";
import { localize } from "../routes";

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

/** The win rate as a ring: decorative, the number inside it is the text. */
function WinRing({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="row-details__ring">
      <svg viewBox="0 0 104 104" aria-hidden="true" focusable="false">
        <circle className="row-details__ring-track" cx="52" cy="52" r={RING_R} />
        <circle
          className="row-details__ring-value"
          cx="52"
          cy="52"
          r={RING_R}
          strokeDasharray={`${(pct / 100) * RING_C} ${RING_C}`}
        />
      </svg>
      <p className="row-details__ring-label">
        <b>{Math.round(pct)}%</b>
        <span>{label}</span>
      </p>
    </div>
  );
}

function StandingText({ value }: { value: Standing }) {
  const t = useT(dict).details;
  if (value.kind === "uncounted") {
    return (
      <>
        <p className="row-details__gap-main">{t.uncounted(value.games)}</p>
        <p>{t.threshold(value.threshold)}</p>
      </>
    );
  }
  const unit = value.metric === "avg" ? t.perGame : t.pointsUnit;
  if (value.kind === "leader") {
    return (
      <p className="row-details__gap-main">
        {t.leader}{" "}
        {value.next && (
          <>
            {t.leadOver(value.next.nick)} <strong>{formatNumber(value.lead)}</strong> {unit}.
          </>
        )}
      </p>
    );
  }
  if (value.gap === 0) return <p className="row-details__gap-main">{t.tieWith(value.target.place, value.target.nick)}.</p>;
  return (
    <p className="row-details__gap-main">
      {t.gapTo(value.target.place, value.target.nick)} <strong>{formatNumber(value.gap)}</strong> {unit}.
    </p>
  );
}

/** A row's details: win rate, wins by role, the gap to the next place, and every kind of point. */
export default function RowDetails({ row, season }: { row: RatingRow; season: Season }) {
  const t = useT(dict);
  const { lang } = useLang();
  const d = t.details;
  const player = playerByImafiaId(row.id);
  const where = standing(row, season);
  const pct = winRate(row);
  const roles = [
    { label: d.winsTotal, value: row.wins, strong: true },
    { label: d.asDon, value: row.donWins },
    { label: d.asSheriff, value: row.sheriffWins },
    { label: d.asOther, value: otherRoleWins(row) },
    { label: d.firstKilled, value: row.firstKilled, muted: true },
  ];
  const extras = [
    { label: d.extraPlus, value: row.extraPlus },
    { label: d.extraMinus, value: row.extraMinus },
    { label: d.discipline, value: row.discipline },
    { label: d.bestMoves, value: row.bestMoves },
  ].filter((part) => part.value !== 0);

  return (
    <div className="row-details">
      <div className="row-details__win">
        <WinRing pct={pct} label={d.won} />
        <p className="visually-hidden">{d.winRate(formatNumber(Math.round(pct)))}</p>
      </div>

      <div className="row-details__roles">
        <h3 className="row-details__title">{d.rolesTitle}</h3>
        <dl>
          {roles.map((role) => (
            <div key={role.label} className={`row-details__role${role.strong ? " is-strong" : ""}${role.muted ? " is-muted" : ""}`}>
              <dt>{role.label}</dt>
              <dd>
                <span className="row-details__track" aria-hidden="true">
                  <i style={{ width: `${row.games ? Math.min(100, (role.value / row.games) * 100) : 0}%` }} />
                </span>
                <b>{role.value}</b>
              </dd>
            </div>
          ))}
        </dl>
        <p className="row-details__note">
          {d.rolesNote}
          {player && (
            <>
              {" "}
              <Link to={`${localize(`/players/${player.slug}`, lang)}#roles`}>{d.rolesAllTime}</Link>
            </>
          )}
        </p>
      </div>

      <div className="row-details__side">
        {where && (
          <div className="row-details__gap">
            <StandingText value={where} />
          </div>
        )}
        <div className="row-details__points">
          <h3 className="row-details__title">{d.pointsTitle}</h3>
          <dl>
            <div>
              <dt>{d.pointsTotal}</dt>
              <dd>{formatNumber(row.points)}</dd>
            </div>
            <div>
              <dt>{d.base}</dt>
              <dd>{formatNumber(basePoints(row))}</dd>
            </div>
            <div>
              <dt>{d.extra}</dt>
              <dd>
                {formatSigned(row.extraSum)}
                {extras.length > 0 && (
                  <span className="row-details__parts">
                    {" "}
                    ({extras.map((part) => `${part.label} ${formatSigned(part.value)}`).join(" · ")})
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt>{d.extraPerGame}</dt>
              <dd>{formatSigned(extraPerGame(row), 2)}</dd>
            </div>
            {row.ci !== 0 && (
              <div>
                <dt>{d.ci}</dt>
                <dd>{formatNumber(row.ci)}</dd>
              </div>
            )}
          </dl>
        </div>
        {player && (
          <Link className="row-details__profile" to={localize(`/players/${player.slug}`, lang)}>
            {d.profile} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
