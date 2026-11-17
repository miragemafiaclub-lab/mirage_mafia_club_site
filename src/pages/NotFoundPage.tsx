import { Link } from "react-router";
import { useLang, useT } from "../i18n/lang";
import { pages } from "../i18n/pages";
import { localize } from "../routes";

export default function NotFoundPage() {
  const t = useT(pages);
  const { lang } = useLang();
  return (
    <section className="page-stub">
      <p className="page__eyebrow">{t.notFound.eyebrow}</p>
      <h1 className="page__title">{t.notFound.title}</h1>
      <p className="page__lead">{t.notFound.text}</p>
      <div className="page__actions">
        <Link className="page__btn page__btn--primary" to={localize("/", lang)}>
          {t.toHome} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
