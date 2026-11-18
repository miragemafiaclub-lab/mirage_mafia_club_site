// Used only at build time by scripts/build.mjs to turn every page into ready-made HTML.
// Never hot-reloaded, so mixing exports here is fine.
/* oxlint-disable react/only-export-components */
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { heroPreloadTag } from "./components/heroImage";
import { headHtml, headTags, pageMeta } from "./meta";
import { PageDataProvider } from "./pageData";
import { prerenderPaths, resolveRoute } from "./routes";
import { pageDataFor } from "./server/pageData";
import { SITE_URL } from "./site";

export { prerenderPaths, SITE_URL };

export function render(url: string) {
  const route = resolveRoute(url);
  const pageData = pageDataFor(route);
  const cache = new Map<string, unknown>(pageData ? [[pageData.url, pageData.data]] : []);
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <PageDataProvider cache={cache}>
          <App />
        </PageDataProvider>
      </StaticRouter>
    </StrictMode>,
  );
  const meta = pageMeta(route);
  // The home page's largest paint is the hero photo: let the browser start it from the head.
  const head = headHtml(headTags(meta)) + (route.page === "home" ? `\n    ${heroPreloadTag()}` : "");
  return { html, head, lang: route.lang, page: route.page, noindex: meta.noindex, pageData };
}
