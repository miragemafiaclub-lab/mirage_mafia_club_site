import { Link } from "react-router";
import nightPhoto from "../assets/web/about-small-589.webp";
import { useLang, useT } from "../i18n/lang";
import { pages } from "../i18n/pages";
import { useSectionHref } from "../RouteContext";
import { localize } from "../routes";
import "./not-found.css";

export default function NotFoundPage() {
  const t = useT(pages);
  const { lang } = useLang();
  const sectionHref = useSectionHref();
  return (
    <section className="page-stub not-found">
      <div className="not-found__text">
        <p className="page__eyebrow">{t.notFound.eyebrow}</p>
        <h1 className="page__title">{t.notFound.title}</h1>
        <p className="page__lead">{t.notFound.text}</p>
        <div className="page__actions">
          <Link className="page__btn page__btn--primary" to={localize("/", lang)}>
            {t.toHome} <span aria-hidden="true">→</span>
          </Link>
          <Link className="page__btn" to={sectionHref("schedule")}>
            {t.notFound.schedule} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <figure className="not-found__photo">
        <img src={nightPhoto} alt={t.notFound.photoAlt} width={589} height={690} decoding="async" />
        <figcaption>
          <span className="not-found__code" aria-hidden="true">
            404
          </span>
          {t.notFound.caption}
        </figcaption>
      </figure>
    </section>
  );
}
