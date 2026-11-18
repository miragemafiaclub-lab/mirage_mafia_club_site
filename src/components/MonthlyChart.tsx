import { useState } from "react";
import { formatNumber } from "../data/ratingView";
import { niceScale } from "./chartScale";
import "./MonthlyChart.css";

export type MonthBar = { label: string; fullLabel: string; points: number; place: number; counted: boolean };

const SLOT = 56;
const BAR = 24;
const HEIGHT = 180;
const TOP = 22;
const BOTTOM = 28;

/** Club points per month: one orange column per month, the best month labelled, every month on hover/focus. */
export default function MonthlyChart({ bars, caption, tooltip }: { bars: MonthBar[]; caption: string; tooltip: (bar: MonthBar) => string }) {
  const [active, setActive] = useState<number | null>(null);
  const { top, step } = niceScale(Math.max(...bars.map((b) => b.points), 0));
  const width = bars.length * SLOT;
  const plot = HEIGHT - TOP - BOTTOM;
  const y = (value: number) => TOP + plot - (Math.max(value, 0) / top) * plot;
  const best = bars.reduce((bi, b, i) => (b.points > bars[bi].points ? i : bi), 0);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  return (
    <figure className="month-chart">
      <figcaption className="visually-hidden">{caption}</figcaption>
      <div className="month-chart__scroll">
        <svg
          className="month-chart__svg"
          viewBox={`0 0 ${width + 36} ${HEIGHT}`}
          width={width + 36}
          height={HEIGHT}
          role="img"
          aria-label={caption}
        >
          <g className="month-chart__grid">
            {ticks.map((tick) => (
              <g key={tick}>
                <line x1={36} x2={width + 36} y1={y(tick)} y2={y(tick)} />
                <text x={30} y={y(tick) + 4} textAnchor="end">
                  {formatNumber(tick)}
                </text>
              </g>
            ))}
          </g>
          {bars.map((bar, i) => {
            const x = 36 + i * SLOT + (SLOT - BAR) / 2;
            const h = Math.max(TOP + plot - y(bar.points), bar.points > 0 ? 2 : 0);
            const r = Math.min(4, h);
            const yTop = TOP + plot - h;
            return (
              <g
                key={bar.fullLabel}
                className={`month-chart__bar${bar.counted ? "" : " is-uncounted"}${active === i ? " is-active" : ""}`}
                tabIndex={0}
                aria-label={tooltip(bar)}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                {/* Hit area: the whole slot, taller than the column. */}
                <rect x={36 + i * SLOT} y={TOP} width={SLOT} height={plot} fill="transparent" />
                {h > 0 && (
                  <path
                    d={`M${x},${TOP + plot} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + BAR - r} Q${x + BAR},${yTop} ${x + BAR},${yTop + r} V${TOP + plot} Z`}
                  />
                )}
                {(i === best || active === i) && (
                  <text className="month-chart__value" x={x + BAR / 2} y={yTop - 6} textAnchor="middle">
                    {formatNumber(bar.points)}
                  </text>
                )}
                <text className="month-chart__label" x={x + BAR / 2} y={HEIGHT - 8} textAnchor="middle">
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="month-chart__tip" aria-live="polite">
        {active !== null ? tooltip(bars[active]) : " "}
      </p>
    </figure>
  );
}
