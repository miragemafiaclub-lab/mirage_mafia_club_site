import { useRef, useState } from "react";
import tablePhoto from "../assets/about-small.jpeg";
import { SIGNUP_URL, gameOn, nextGame, warsawNow, weekDates, weekIndex } from "../data/schedule";
import { schedule } from "../i18n/schedule";
import { useT } from "../i18n/lang";
import "./Schedule.css";

// How far ahead the week switcher goes.
const MAX_WEEKS_AHEAD = 4;
const DAY_MS = 86_400_000;

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M9 12.5 11 14.5 15 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d={direction === "left" ? "M14.5 6 8.5 12l6 6" : "M9.5 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Whole days from one midnight to another; rounding absorbs the hour lost or gained on a clock change.
function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export default function Schedule() {
  const t = useT(schedule);
  const now = warsawNow();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const next = nextGame(now);

  // Open on the week of the nearest game: late on Sunday that is already the next week.
  const [weekOffset, setWeekOffset] = useState(() =>
    next ? Math.floor((weekIndex(today) + daysBetween(today, next.date)) / 7) : 0,
  );
  const [pickedTime, setPickedTime] = useState<number | null>(null);
  const cardRef = useRef<HTMLElement>(null);

  // The card shows the day the visitor picked; before that, or once that game has started, the nearest one.
  const selected = (pickedTime !== null && gameOn(new Date(pickedTime), now)) || next;
  const days = weekDates(now, weekOffset);

  function dayLabel(date: Date) {
    const daysAway = daysBetween(today, date);
    if (daysAway === 0) return t.today;
    if (daysAway === 1) return t.tomorrow;
    return t.daysFull[weekIndex(date)];
  }

  function pickDay(date: Date) {
    setPickedTime(date.getTime());
    // On narrow screens the card sits above the week: bring it back when most of it is off screen.
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visible < rect.height / 2) card.scrollIntoView({ block: "nearest" });
  }

  return (
    <section className="schedule" id="schedule">
      <div className="schedule__head">
        <p className="schedule__eyebrow">{t.eyebrow}</p>
        <h2 className="schedule__title">{t.title}</h2>
        <p className="schedule__subtitle">{t.subtitle}</p>
      </div>

      <div className="schedule__layout">
        {selected && (
          <article className="schedule-next" aria-label={t.selectedGame} aria-live="polite" ref={cardRef}>
            {/* Keyed by date, so the details fade in again when another day is picked. */}
            <div className="schedule-next__details" key={selected.date.getTime()}>
              <p className="schedule-next__day">{dayLabel(selected.date)}</p>
              <p className="schedule-next__date">{t.fullDate(selected.date)}</p>
              <p className="schedule-next__time">{selected.event.time ?? t.timeTba}</p>

              <ul className="schedule-next__facts">
                <li>
                  <PinIcon />
                  {t.place}
                </li>
                <li>
                  <TagIcon />
                  {t.events[selected.event.kind]}
                </li>
              </ul>
            </div>

            <a
              className="schedule-next__cta"
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.signupLabel}
            >
              {t.signup} <span aria-hidden="true">→</span>
            </a>
          </article>
        )}

        <div className="schedule-week" role="group" aria-label={t.weekGroup}>
          <div className="schedule-week__nav">
            <button
              type="button"
              className="schedule-week__arrow"
              aria-label={t.prevWeek}
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              <ChevronIcon direction="left" />
            </button>
            <p className="schedule-week__range" aria-live="polite">
              {t.weekRange(days[0].date, days[6].date)}
            </p>
            <button
              type="button"
              className="schedule-week__arrow"
              aria-label={t.nextWeek}
              disabled={weekOffset === MAX_WEEKS_AHEAD}
              onClick={() => setWeekOffset(weekOffset + 1)}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <ul className="schedule-week__days">
            {days.map((day, index) => {
              const open = gameOn(day.date, now) !== null;
              const isSelected = selected?.date.getTime() === day.date.getTime();
              const isToday = today.getTime() === day.date.getTime();
              const cells = (
                <>
                  <span className="schedule-week__day">
                    {t.daysShort[index]} <span className="schedule-week__date">{day.date.getDate()}</span>
                  </span>
                  <span className="schedule-week__event">
                    {day.event ? (
                      <>
                        <span className="schedule-week__kind">{t.events[day.event.kind]}</span>
                        <span className="schedule-week__time">{day.event.time ?? t.timeTbaShort}</span>
                      </>
                    ) : (
                      <span className="schedule-week__rest" aria-label={t.noGame}>
                        —
                      </span>
                    )}
                  </span>
                </>
              );

              return (
                <li
                  key={day.day}
                  className={`schedule-week__item${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}${
                    day.event && !open ? " is-past" : ""
                  }`}
                >
                  {open && day.event ? (
                    <button
                      type="button"
                      className="schedule-week__row"
                      aria-pressed={isSelected}
                      onClick={() => pickDay(day.date)}
                    >
                      {cells}
                    </button>
                  ) : (
                    <div className="schedule-week__row">{cells}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <figure className="schedule-photo">
          <img src={tablePhoto} alt={t.photoAlt} loading="lazy" decoding="async" />
          <figcaption className="schedule-photo__caption">
            {t.caption[0]}
            <br />
            {t.caption[1]}
            <br />
            <span>{t.caption[2]}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
