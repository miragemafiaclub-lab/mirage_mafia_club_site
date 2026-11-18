import { Link } from "react-router";
import { SIGNUP_URL } from "../data/schedule";
import { EVENING_ORDER, MAFIA_SCHOOL_URL, MAP_URL, MIN_PRICE_ZL, PRICES_ZL, weeklySlots, type EveningKind } from "../data/visit";
import { firstTime } from "../i18n/firstTime";
import { useLang, useT } from "../i18n/lang";
import { schedule } from "../i18n/schedule";
import { useSectionHref } from "../RouteContext";
import { STATIC_PAGES, localize } from "../routes";
import "./first-time.css";

function SignupLink({ className }: { className: string }) {
  const t = useT(firstTime);
  return (
    <a className={className} href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" aria-label={t.signupLabel}>
      {t.signup} <span aria-hidden="true">↗</span>
    </a>
  );
}

/** "Вторник и пятница, 18:30" from the weekly schedule, or the copy's own line for evenings outside it. */
function useWhen(): (kind: EveningKind) => string | null {
  const t = useT(firstTime);
  const days = useT(schedule).daysFull;
  return (kind) => {
    const slots = weeklySlots(kind);
    if (!slots.length) return t.evenings[kind].when;
    return t.slots(
      slots.map((slot) => days[slot.dayIndex]),
      slots[0].time ?? t.timeInTelegram,
    );
  };
}

export default function FirstTimePage() {
  const t = useT(firstTime);
  const { lang } = useLang();
  const sectionHref = useSectionHref();
  const when = useWhen();

  const facts = [
    { value: t.facts.price(MIN_PRICE_ZL), sub: t.facts.priceSub },
    { value: t.facts.lang, sub: t.facts.langSub },
    { value: t.facts.place, sub: t.facts.placeSub },
  ];

  return (
    <article className="first-time">
      <header className="first-time__intro">
        <p className="page__eyebrow">{t.eyebrow}</p>
        <h1 className="page__title">{t.title}</h1>
        <p className="page__lead">{t.lead}</p>
        <div className="page__actions">
          <SignupLink className="page__btn page__btn--primary" />
          <Link className="page__btn" to={sectionHref("schedule")}>
            {t.schedule} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <dl className="first-time__facts">
          {facts.map((fact) => (
            <div key={fact.value}>
              <dt>{fact.value}</dt>
              <dd>{fact.sub}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="first-time__section" aria-labelledby="ft-evening">
        <h2 className="first-time__h2" id="ft-evening">
          {t.eveningTitle}
        </h2>
        <ol className="first-time__steps">
          {t.steps.map((step, i) => (
            <li key={step.title}>
              <span className="first-time__step-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {i === t.steps.length - 1 && (
                <Link className="first-time__link" to={localize(STATIC_PAGES.rating, lang)}>
                  {t.ratingLink} <span aria-hidden="true">→</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="first-time__section" aria-labelledby="ft-prices">
        <h2 className="first-time__h2" id="ft-prices">
          {t.pricesTitle}
        </h2>
        <p className="first-time__lead">{t.pricesLead}</p>
        <ul className="first-time__evenings">
          {EVENING_ORDER.map((kind, i) => {
            const copy = t.evenings[kind];
            return (
              <li className={`first-time__evening${i === 0 ? " is-recommended" : ""}`} key={kind}>
                {i === 0 && <p className="first-time__badge">{t.recommended}</p>}
                <h3>{copy.name}</h3>
                <p className="first-time__when">{when(kind)}</p>
                {copy.note && <p className="first-time__note">{copy.note}</p>}
                <p className="first-time__price">{t.zl(PRICES_ZL[kind])}</p>
              </li>
            );
          })}
        </ul>
        <p className="first-time__payment">{t.payment}</p>
      </section>

      <section className="first-time__section first-time__split" aria-labelledby="ft-find">
        <div>
          <h2 className="first-time__h2" id="ft-find">
            {t.findTitle}
          </h2>
          <p className="first-time__address">{t.address}</p>
          <p className="first-time__lead">{t.building}</p>
          <a className="page__btn first-time__map" href={MAP_URL} target="_blank" rel="noopener noreferrer" aria-label={t.mapLabel}>
            {t.map} <span aria-hidden="true">↗</span>
          </a>
        </div>
        <ol className="first-time__route">
          {t.route.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      <section className="first-time__section" aria-labelledby="ft-rules">
        <h2 className="first-time__h2" id="ft-rules">
          {t.rulesTitle}
        </h2>
        <p className="first-time__lead">{t.rulesLead}</p>
        <ul className="first-time__rules">
          {t.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="first-time__section" aria-labelledby="ft-faq">
        <h2 className="first-time__h2" id="ft-faq">
          {t.faqTitle}
        </h2>
        <div className="first-time__faq">
          {t.faq.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>
                {item.a}
                {item.school && (
                  <>
                    {" "}
                    <a
                      className="first-time__link"
                      href={MAFIA_SCHOOL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t.schoolLabel}
                    >
                      {t.school} <span aria-hidden="true">↗</span>
                    </a>
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="first-time__cta" aria-labelledby="ft-cta">
        <h2 className="first-time__h2" id="ft-cta">
          {t.ctaTitle}
        </h2>
        <p className="first-time__lead">{t.ctaText}</p>
        <div className="page__actions">
          <SignupLink className="page__btn page__btn--primary" />
        </div>
      </section>
    </article>
  );
}
