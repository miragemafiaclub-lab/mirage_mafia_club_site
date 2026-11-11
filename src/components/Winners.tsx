import { useEffect, useReducer, useRef, type CSSProperties, type PointerEvent } from "react";
import logo from "../assets/logo.jpeg";
import { CLUB_STATS } from "../data/clubStats";
import { buildMonths, buildYearTabs, type WinnerMonth } from "../data/winners";
import { useInView } from "../hooks/useInView";
import { useLang, useT, type Lang } from "../i18n/lang";
import { winnersText } from "../i18n/winners";
import "./Winners.css";

const NOW = new Date();
const MONTHS = buildMonths(NOW);
const YEAR_TABS = buildYearTabs(MONTHS);

function latestWithWinner(months: WinnerMonth[]) {
  return [...months].reverse().find((month) => month.winner) ?? months[months.length - 1];
}

const MONTHLY_WINNERS = MONTHS.filter((month) => month.winner).length;

// Oswald (uppercase) renders at roughly this many em per character; size each word so it
// always peeks out from behind the phone by about the same amount. Cyrillic capitals run
// wider (measured over the month names: ~0.52em vs ~0.49em for Latin), hence the two ratios.
const MONTH_WORD_WIDTH_TO_PHONE = 1.6;
const MONTH_WORD_CHAR_RATIO: Record<Lang, number> = { en: 0.46, ru: 0.49 };

function monthWordFontSize(word: string, lang: Lang) {
  const scale = MONTH_WORD_WIDTH_TO_PHONE / (word.length * MONTH_WORD_CHAR_RATIO[lang]);
  return `calc(var(--phone-w) * ${scale.toFixed(3)})`;
}

// 1: a later month comes in from the right; -1: an earlier one from the left.
type Direction = 1 | -1;

type View = {
  key: string;
  // 0 until the first change, so nothing slides on load.
  direction: Direction | 0;
  // The month that is on its way out; it stays until its exit has played.
  leaving: WinnerMonth | null;
};

type Change =
  | { type: "show"; key: string; towards?: Direction; still: boolean }
  | { type: "gone" };

function changeView(view: View, change: Change): View {
  if (change.type === "gone") return { ...view, leaving: null };
  if (change.key === view.key) return view;
  const from = MONTHS.findIndex((month) => month.key === view.key);
  const to = MONTHS.findIndex((month) => month.key === change.key);
  return {
    key: change.key,
    direction: change.towards ?? (to > from ? 1 : -1),
    leaving: change.still ? null : MONTHS[from],
  };
}

// A swipe across the phone has to travel this far to turn the month.
const SWIPE_MIN = 40;

// The archive sits under the phone on these screens (see Winners.css).
const STACKED = "(max-width: 1100px)";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Shot({ month, onGone }: { month: WinnerMonth; onGone?: () => void }) {
  const t = useT(winnersText);
  const winner = month.winner;
  return (
    <div className={`winners__shot${onGone ? " is-leaving" : ""}`} onAnimationEnd={onGone}>
      {winner?.photo ? (
        <img src={winner.photo} alt={onGone ? "" : t.photoAlt(winner.nick)} draggable={false} />
      ) : (
        <img className="winners__frame-logo" src={logo} alt="" draggable={false} />
      )}
    </div>
  );
}

function MonthName({ month, leaving }: { month: WinnerMonth; leaving?: boolean }) {
  const { lang } = useLang();
  const name = winnersText[lang].months[month.month];
  return (
    <span
      className={`winners__month-name${leaving ? " is-leaving" : ""}`}
      style={{ fontSize: monthWordFontSize(name, lang) }}
    >
      {name}
    </span>
  );
}

function FrameText({ month, leaving }: { month: WinnerMonth; leaving?: boolean }) {
  const t = useT(winnersText);
  const winner = month.winner;
  return (
    <div className={`winners__frame-text${leaving ? " is-leaving" : ""}`} aria-hidden={leaving || undefined}>
      <p className="winners__frame-month">
        {t.months[month.month]} {month.year}
      </p>
      <p className="winners__frame-badge">{t.badge}</p>
      <p className="winners__frame-nick">{winner?.nick ?? t.soon}</p>
    </div>
  );
}

export default function Winners() {
  const t = useT(winnersText);
  const [view, change] = useReducer(changeView, {
    key: latestWithWinner(MONTHS).key,
    direction: 0,
    leaving: null,
  });
  const [showcaseRef, showcaseInView] = useInView<HTMLDivElement>(0.35);
  const [gridRef, gridInView] = useInView<HTMLDivElement>(0.15);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const phoneWatch = useRef<IntersectionObserver | null>(null);

  const { key: activeKey, leaving } = view;
  const activeIndex = MONTHS.findIndex((month) => month.key === activeKey);
  const active = MONTHS[activeIndex];
  const winner = active.winner;
  const yearMonths = MONTHS.filter((month) => month.year === active.year);
  const sidebarMonths = yearMonths.slice(-6).reverse();

  const stats = [
    { value: String(MONTHLY_WINNERS), lines: t.stats.monthly },
    { value: CLUB_STATS.tournamentWins, lines: t.stats.wins },
    { value: CLUB_STATS.players, lines: t.stats.players },
    { value: "3", lines: t.stats.years },
  ];

  function show(key: string, towards?: Direction) {
    change({ type: "show", key, towards, still: reducedMotion() });
  }

  // The arrows and the swipe wrap around the list, so they say which way they go.
  function step(towards: Direction) {
    show(MONTHS[(activeIndex + towards + MONTHS.length) % MONTHS.length].key, towards);
  }

  function selectYear(year: number) {
    show(latestWithWinner(MONTHS.filter((month) => month.year === year)).key);
  }

  // A pending "change the month once the phone is on screen" must not outlive the section.
  useEffect(() => () => phoneWatch.current?.disconnect(), []);

  // On a narrow screen the phone is far above the archive: go up to it first
  // and change the month once it is on screen, so the change is seen.
  function showFromArchive(key: string) {
    const showcase = showcaseRef.current;
    phoneWatch.current?.disconnect();
    if (!showcase || !("IntersectionObserver" in window) || !window.matchMedia(STACKED).matches) {
      return show(key);
    }
    const { top, bottom } = showcase.getBoundingClientRect();
    if (top >= 0 && bottom <= window.innerHeight) return show(key);

    // Nearly all of the showcase, or as much of it as the window can hold.
    const share = Math.min(1, window.innerHeight / (bottom - top)) * 0.9;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < share) return;
        watch.disconnect();
        show(key);
      },
      { threshold: share },
    );
    watch.observe(showcase);
    phoneWatch.current = watch;
    showcase.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
  }

  function onSwipeStart(event: PointerEvent) {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }

  function onSwipeEnd(event: PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.abs(x) < SWIPE_MIN || Math.abs(x) < Math.abs(y)) return;
    // Dragging the photo to the left brings the next month.
    step(x < 0 ? 1 : -1);
  }

  function onSwipeCancel() {
    swipeStart.current = null;
  }

  useEffect(() => {
    const grid = gridRef.current;
    const card = grid?.querySelector<HTMLElement>(".archive-card.is-active");
    if (!grid || !card) return;
    grid.scrollTo({
      left: card.offsetLeft - (grid.clientWidth - card.offsetWidth) / 2,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }, [activeKey, gridRef]);

  return (
    <div className="winners-page">
      <section className="winners" id="winners">
        <div className="winners__bg" aria-hidden="true">
          <img className="winners__watermark-logo" src={logo} alt="" />
          <span className="winners__ring" />
        </div>

        <div className="winners__layout">
          <div className="winners__intro">
            <p className="winners__eyebrow">{t.eyebrow}</p>
            <h2 className="winners__title">
              <span className="winners__title-line">{t.titleLines[0]}</span>{" "}
              <span className="winners__title-line winners__title-line--accent">{t.titleLines[1]}</span>
            </h2>
            <p className="winners__lead">{t.lead}</p>
            <a className="winners__cta" href="#archive">
              {t.allWinners} <span aria-hidden="true">→</span>
            </a>

            <dl className="winners__stats">
              {stats.map((stat) => (
                <div className="winners__stat" key={stat.lines.join(" ")}>
                  <dt>{stat.value}</dt>
                  <dd>
                    {stat.lines[0]}
                    <br />
                    {stat.lines[1]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className={`winners__showcase${showcaseInView ? " is-in" : ""}`}
            style={{ "--dir": view.direction } as CSSProperties}
            ref={showcaseRef}
          >
            <button
              type="button"
              className="winners__nav winners__nav--prev"
              onClick={() => step(-1)}
              aria-label={t.prev}
            >
              ←
            </button>

            <div className="winners__month-word" aria-hidden="true">
              {leaving && <MonthName month={leaving} leaving key={`out-${leaving.key}`} />}
              <MonthName month={active} key={active.key} />
            </div>

            <div
              className="winners__phone"
              onPointerDown={onSwipeStart}
              onPointerUp={onSwipeEnd}
              onPointerCancel={onSwipeCancel}
              onPointerLeave={onSwipeCancel}
            >
              <span className="winners__phone-notch" aria-hidden="true" />

              <div className="winners__frame">
                {leaving && (
                  <Shot month={leaving} onGone={() => change({ type: "gone" })} key={`out-${leaving.key}`} />
                )}
                <Shot month={active} key={active.key} />

                <div className="winners__frame-overlay">
                  {leaving && <FrameText month={leaving} leaving key={`out-${leaving.key}`} />}
                  <FrameText month={active} key={active.key} />
                </div>
                {winner && (
                  <a
                    className="winners__frame-link"
                    href={winner.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.profile(winner.nick)}
                  >
                    <span aria-hidden="true">→</span>
                  </a>
                )}
                <span className="winners__frame-home" aria-hidden="true" />
              </div>
            </div>

            <button
              type="button"
              className="winners__nav winners__nav--next"
              onClick={() => step(1)}
              aria-label={t.next}
            >
              →
            </button>
          </div>

          <div className="winners__side">
            <div className="winners__months">
              {sidebarMonths.map((month) => (
                <button
                  type="button"
                  key={month.key}
                  className={`winners__month${month.key === activeKey ? " is-active" : ""}`}
                  onClick={() => show(month.key)}
                >
                  {t.months[month.month]}
                </button>
              ))}
            </div>

            <p className="winners__select-hint">
              {active.year}
              <br />
              <span>{t.selectMonth}</span>
            </p>
          </div>
        </div>

      </section>

      <section className="archive" id="archive">
        <div className="archive__head">
          <h2 className="archive__title">{t.archiveTitle}</h2>
          <div className="archive__rule" />
          <p className="archive__hint">{t.archiveHint}</p>
          <div className="archive__years" role="group" aria-label={t.yearsLabel}>
            {YEAR_TABS.map((year) => (
              <button
                type="button"
                key={year}
                className={`archive__year${year === active.year ? " is-active" : ""}`}
                aria-pressed={year === active.year}
                onClick={() => selectYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className={`archive__grid${gridInView ? " is-in" : ""}`} ref={gridRef}>
          {yearMonths.map((month, index) => (
            <button
              type="button"
              key={month.key}
              className={`archive-card${month.key === activeKey ? " is-active" : ""}`}
              style={{ "--i": index } as CSSProperties}
              onClick={() => showFromArchive(month.key)}
            >
              <div className="archive-card__photo">
                {month.winner?.photo ? (
                  <img src={month.winner.photo} alt={t.archivePhotoAlt(month.winner.nick, t.months[month.month])} />
                ) : (
                  <img className="archive-card__logo" src={logo} alt="" />
                )}
                <p className="archive-card__month">{t.months[month.month]}</p>
                <div className="archive-card__foot">
                  <p className="archive-card__nick">{month.winner?.nick ?? t.soon}</p>
                  {month.winner && (
                    <span className="archive-card__arrow" aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
