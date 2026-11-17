import heroTable from "../assets/hero-table.jpeg";
import { CLUB_PLACE, nextGame, weekIndex } from "../data/schedule";
import { useClubNow, useHydrated } from "../hooks/useHydrated";
import { hero } from "../i18n/hero";
import { useT } from "../i18n/lang";
import "./Hero.css";

function isoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function Hero() {
  const t = useT(hero);
  // In the club's time zone. "Today/tomorrow" depends on the visitor's clock, so it appears once the page is live.
  const now = useClubNow();
  const hydrated = useHydrated();
  const game = hydrated ? nextGame(now) : null;

  let gameLine: string | null = null;
  if (game) {
    const dayDiff = Math.round(
      (game.date.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000,
    );
    const day = dayDiff === 0 ? t.today : dayDiff === 1 ? t.tomorrow : t.days[weekIndex(game.date)];
    // Street only: the floor in CLUB_PLACE.address is Russian-only.
    gameLine = [day, game.event.time ?? t.timeTbd, CLUB_PLACE.address.split(",")[0]].join(", ");
  }

  return (
    <section className="hero" id="home">
      <img className="hero__bg" src={heroTable} alt={t.bgAlt} fetchPriority="high" />
      <div className="hero__overlay" />

      <div className="hero__content">
        <p className="hero__eyebrow">{t.subtitle}</p>
        <h1 className="hero__title">
          Mirage{" "}
          <br />
          Mafia Club
        </h1>
        <p className="hero__script">{t.script}</p>
        <p className="hero__lead">
          {t.leadTitle}
          <br />
          {t.leadText}
        </p>

        {game && gameLine && (
          <p className="hero__next">
            <span className="hero__next-dot" aria-hidden="true" />
            {t.nextLabel}: <time dateTime={isoDate(game.date)}>{gameLine}</time>
          </p>
        )}

        <div className="hero__actions">
          <a className="hero__btn hero__btn--primary" href="#schedule">
            {t.play} <span aria-hidden="true">→</span>
          </a>
          <a className="hero__btn hero__btn--ghost" href="#about">
            {t.about}
          </a>
        </div>
      </div>

      <ul className="hero__side-words" aria-hidden="true">
        {t.sideWords.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ul>

      <a className="hero__scroll" href="#about">
        <span className="hero__scroll-line" aria-hidden="true" />
        {t.scroll}
      </a>
    </section>
  );
}
