import { Link } from "react-router";
import { SIGNUP_URL, nextGame, weekIndex } from "../data/schedule";
import { MIN_PRICE_ZL } from "../data/visit";
import { useClubNow } from "../hooks/useHydrated";
import { closingCta } from "../i18n/closingCta";
import { useLang, useT } from "../i18n/lang";
import { schedule } from "../i18n/schedule";
import { STATIC_PAGES, localize } from "../routes";
// The buttons reuse the hero's pill buttons.
import "./Hero.css";
import "./ClosingCta.css";

/** The last band on the home page, right before the footer: the next game and the way to sign up. */
export default function ClosingCta() {
  const t = useT(closingCta);
  const s = useT(schedule);
  const { lang } = useLang();
  const game = nextGame(useClubNow());

  const time = game && (game.event.time ?? (game.event.usualTime ? s.usually(game.event.usualTime) : s.timeTba));

  return (
    <section className="closing-cta" aria-labelledby="closing-cta-title">
      <div className="closing-cta__inner">
        <div className="closing-cta__text">
          <p className="closing-cta__eyebrow">{t.eyebrow}</p>
          <h2 className="closing-cta__title" id="closing-cta-title">
            {t.title}
          </h2>
          <ul className="closing-cta__facts">
            {game && (
              <li>
                <span className="closing-cta__label">{t.nextLabel}</span>
                <span className="closing-cta__value">
                  {s.daysFull[weekIndex(game.date)]}, {s.fullDate(game.date)} · {time}
                </span>
              </li>
            )}
            <li>
              <span className="closing-cta__value">{t.place}</span>
            </li>
            <li>
              <span className="closing-cta__value closing-cta__value--accent">{t.fromPrice(MIN_PRICE_ZL)}</span>
            </li>
          </ul>
        </div>

        <div className="closing-cta__actions">
          <a
            className="hero__btn hero__btn--primary"
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.signupLabel}
          >
            {t.signup} <span aria-hidden="true">↗</span>
          </a>
          <Link className="hero__btn hero__btn--ghost" to={localize(STATIC_PAGES.firstTime, lang)}>
            {t.firstTime}
          </Link>
        </div>
      </div>
    </section>
  );
}
