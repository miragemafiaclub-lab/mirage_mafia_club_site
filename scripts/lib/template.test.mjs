import { describe, expect, it } from "vitest";
import { fillTemplate } from "./template.mjs";

const template =
  '<!doctype html>\n<html lang="ru">\n<head><!--head-start--><title>x</title><!--head-end--></head>\n<body><div id="root"><!--app-html--></div>\n  </body>\n</html>\n';

const page = (extra = {}) => ({ lang: "en", head: "<title>Rating</title>", html: "<h1>Rating</h1>", pageData: null, ...extra });

describe("fillTemplate", () => {
  it("fills lang, head and page HTML", () => {
    const html = fillTemplate(template, page());
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<head><title>Rating</title></head>");
    expect(html).toContain('<div id="root"><h1>Rating</h1></div>');
    expect(html).not.toContain("page-data");
  });

  // iMafia nicks are free text: "$&", "$`", "$'" and "$$" must reach the page as typed,
  // not be read as String.replace patterns.
  it.each(["Ca$$h", "Mr$&Co", "$`Back", "Quote$'", "$1"])("keeps the nick %s as is", (nick) => {
    const data = { url: "/data/rating.json", data: { nicks: { 1: nick } } };
    const html = fillTemplate(template, page({ head: `<title>${nick}</title>`, html: `<h1>${nick}</h1>`, pageData: data }));
    expect(html).toContain(`<title>${nick}</title>`);
    expect(html).toContain(`<h1>${nick}</h1>`);
    const embedded = html.match(/<script type="application\/json" id="page-data">(.*?)<\/script>/s)[1];
    expect(JSON.parse(embedded)).toEqual(data);
    expect(html.match(/<html/g)).toHaveLength(1);
  });
});
