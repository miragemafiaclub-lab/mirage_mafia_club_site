// Puts one prerendered page into dist/index.html (used by scripts/build.mjs, tested in template.test.mjs).

/**
 * The template with the page's lang, head, HTML and embedded data filled in. Every replacement is a
 * function: a plain string would have its "$&", "$`", "$'" and "$$" read as patterns, and nicks are free text.
 */
export function fillTemplate(template, page) {
  return template
    .replace('<html lang="ru">', () => `<html lang="${page.lang}">`)
    .replace(/<!--head-start-->[\s\S]*?<!--head-end-->/, () => page.head)
    .replace("<!--app-html-->", () => page.html)
    // The page's own data (rating, player stats), so the browser does not fetch it again. "<" is escaped
    // so the JSON can never close the <script> early.
    .replace("</body>", () =>
      page.pageData
        ? `<script type="application/json" id="page-data">${JSON.stringify(page.pageData).replace(/</g, "\\u003c")}</script>\n  </body>`
        : "</body>",
    );
}
