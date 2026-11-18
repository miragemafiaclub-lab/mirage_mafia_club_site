import { Link } from "react-router";
import { useLang, useT } from "../i18n/lang";
import { pages } from "../i18n/pages";
import { localize, type StaticPageId } from "../routes";

/** Placeholder for a page that gets its content in a later slice. Kept out of search results (see meta.ts). */
export default function StubPage({ page }: { page: Exclude<StaticPageId, "rating" | "compare" | "firstTime"> }) {
  const t = useT(pages);
  const { lang } = useLang();
  const copy = t[page];
  return (
    <section className="page-stub">
      <p className="page__eyebrow">{copy.eyebrow}</p>
      <h1 className="page__title">{copy.title}</h1>
      <p className="page-stub__badge">{t.soon}</p>
      <p className="page__lead">{copy.text}</p>
      <div className="page__actions">
        <Link className="page__btn page__btn--primary" to={localize("/", lang)}>
          {t.toHome} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
