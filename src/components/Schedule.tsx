import { useRef, useState } from "react";
import tablePhoto from "../assets/about-small.jpeg";
import { CLUB_PLACE, SIGNUP_URL, gameOn, nextGame, weekDates, weekIndex } from "../data/schedule";
import "./Schedule.css";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

// For a week that spans two months: the full names do not fit the week switcher.
const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

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

function dayLabel(daysAway: number, name: string) {
  if (daysAway === 0) return "Сегодня";
  if (daysAway === 1) return "Завтра";
  return name;
}

function fullDate(date: Date) {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

function weekRange(first: Date, last: Date) {
  if (first.getMonth() === last.getMonth()) return `${first.getDate()} – ${fullDate(last)}`;
  return `${first.getDate()} ${MONTHS_SHORT[first.getMonth()]} – ${last.getDate()} ${MONTHS_SHORT[last.getMonth()]}`;
}

export default function Schedule() {
  const now = new Date();
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
        <p className="schedule__eyebrow">Schedule</p>
        <h2 className="schedule__title">Next game</h2>
        <p className="schedule__subtitle">Выбери день и запишись на игру</p>
      </div>

      <div className="schedule__layout">
        {selected && (
          <article className="schedule-next" aria-label="Выбранная игра" aria-live="polite" ref={cardRef}>
            {/* Keyed by date, so the details fade in again when another day is picked. */}
            <div className="schedule-next__details" key={selected.date.getTime()}>
              <p className="schedule-next__day">{dayLabel(daysBetween(today, selected.date), selected.name)}</p>
              <p className="schedule-next__date">{fullDate(selected.date)}</p>
              <p className="schedule-next__time">{selected.event.time ?? "Время в анонсе"}</p>

              <ul className="schedule-next__facts">
                <li>
                  <PinIcon />
                  {CLUB_PLACE.address}, {CLUB_PLACE.city}
                </li>
                <li>
                  <TagIcon />
                  {selected.event.title}
                </li>
              </ul>
            </div>

            <a className="schedule-next__cta" href={SIGNUP_URL} target="_blank" rel="noreferrer">
              Записаться <span aria-hidden="true">→</span>
            </a>
          </article>
        )}

        <div className="schedule-week" role="group" aria-label="Расписание на неделю">
          <div className="schedule-week__nav">
            <button
              type="button"
              className="schedule-week__arrow"
              aria-label="Предыдущая неделя"
              disabled={weekOffset === 0}
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              <ChevronIcon direction="left" />
            </button>
            <p className="schedule-week__range" aria-live="polite">
              {weekRange(days[0].date, days[6].date)}
            </p>
            <button
              type="button"
              className="schedule-week__arrow"
              aria-label="Следующая неделя"
              disabled={weekOffset === MAX_WEEKS_AHEAD}
              onClick={() => setWeekOffset(weekOffset + 1)}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <ul className="schedule-week__days">
            {days.map((day) => {
              const open = gameOn(day.date, now) !== null;
              const isSelected = selected?.date.getTime() === day.date.getTime();
              const isToday = today.getTime() === day.date.getTime();
              const cells = (
                <>
                  <span className="schedule-week__day">
                    {day.day} <span className="schedule-week__date">{day.date.getDate()}</span>
                  </span>
                  <span className="schedule-week__event">
                    {day.event ? (
                      <>
                        <span className="schedule-week__kind">{day.event.title}</span>
                        <span className="schedule-week__time">{day.event.time ?? "анонс"}</span>
                      </>
                    ) : (
                      <span className="schedule-week__rest" aria-label="Нет игры">
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
                      aria-label={`${day.name}, ${fullDate(day.date)}: ${day.event.title}, ${
                        day.event.time ?? "время в анонсе"
                      }`}
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
          <img src={tablePhoto} alt="Игрок в маске за столом Mirage во время ночной фазы" loading="lazy" />
          <figcaption className="schedule-photo__caption">
            Same people.
            <br />
            Different roles.
            <br />
            <span>Always good vibes.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
