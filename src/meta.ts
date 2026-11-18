import { playerTitle } from "./data/players";
import { meta as dict } from "./i18n/meta";
import { displayName } from "./i18n/translit";
import { localize, type Route } from "./routes";
import { absoluteUrl } from "./site";

/** One <head> tag: <title>, <meta> or <link>. */
export type HeadTag = { tag: "title"; text: string } | { tag: "meta" | "link"; attrs: Record<string, string> };

/** Pages that are placeholders for now: kept out of search results until they get real content. */
const NOT_READY = new Set<Route["page"]>(["tournaments", "firstTime"]);

const DEFAULT_IMAGE = { url: "/og-image.jpg", width: "1200", height: "630" };

export type PageMeta = {
  title: string;
  description: string;
  canonical: string;
  alternates: { ru: string; en: string };
  image: string;
  imageAlt: string;
  imageSize?: { width: string; height: string };
  type: "website" | "profile";
  locale: string;
  altLocale: string;
  noindex: boolean;
};

export function pageMeta(route: Route): PageMeta {
  const t = dict[route.lang];
  const other = route.lang === "ru" ? "en" : "ru";
  const base = {
    canonical: absoluteUrl(localize(route.path, route.lang)),
    alternates: { ru: absoluteUrl(localize(route.path, "ru")), en: absoluteUrl(localize(route.path, "en")) },
    image: absoluteUrl(DEFAULT_IMAGE.url),
    imageAlt: t.defaultImageAlt,
    imageSize: { width: DEFAULT_IMAGE.width, height: DEFAULT_IMAGE.height },
    type: "website" as const,
    locale: t.locale,
    altLocale: dict[other].locale,
    noindex: NOT_READY.has(route.page) || route.page === "notFound",
  };

  switch (route.page) {
    case "player": {
      const { player } = route;
      return {
        ...base,
        title: t.player.title(player.nick),
        description: t.player.description({
          name: player.name && displayName(player.name, route.lang),
          title: playerTitle(player),
          joinedAt: player.joinedAt,
        }),
        type: "profile",
        // Guests' pages are thin until profiles get stats (slice 3): keep them out of search for now.
        noindex: player.group === "guest",
        ...(player.photo && { image: absoluteUrl(player.photo), imageSize: undefined }),
        imageAlt: t.player.imageAlt(player.nick),
      };
    }
    case "home":
    case "rating":
    case "tournaments":
    case "firstTime":
    case "notFound":
      return { ...base, ...t[route.page] };
  }
}

/** The tags for <head>, in a stable order. */
export function headTags(m: PageMeta): HeadTag[] {
  const meta = (key: "name" | "property", name: string, content: string): HeadTag => ({
    tag: "meta",
    attrs: { [key]: name, content },
  });
  const tags: HeadTag[] = [
    { tag: "title", text: m.title },
    meta("name", "description", m.description),
    { tag: "link", attrs: { rel: "canonical", href: m.canonical } },
    { tag: "link", attrs: { rel: "alternate", hreflang: "ru", href: m.alternates.ru } },
    { tag: "link", attrs: { rel: "alternate", hreflang: "en", href: m.alternates.en } },
    { tag: "link", attrs: { rel: "alternate", hreflang: "x-default", href: m.alternates.ru } },
    meta("property", "og:type", m.type),
    meta("property", "og:site_name", "Mirage Mafia Club"),
    meta("property", "og:url", m.canonical),
    meta("property", "og:title", m.title),
    meta("property", "og:description", m.description),
    meta("property", "og:locale", m.locale),
    meta("property", "og:locale:alternate", m.altLocale),
    meta("property", "og:image", m.image),
    meta("property", "og:image:alt", m.imageAlt),
    meta("name", "twitter:card", "summary_large_image"),
  ];
  if (m.imageSize) {
    tags.push(meta("property", "og:image:width", m.imageSize.width), meta("property", "og:image:height", m.imageSize.height));
  }
  if (m.noindex) tags.push(meta("name", "robots", "noindex"));
  return tags;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** HTML for the prerendered <head>. Every tag carries data-head so the browser can swap them on navigation. */
export function headHtml(tags: HeadTag[]): string {
  return tags
    .map((t) =>
      t.tag === "title"
        ? `<title>${escapeHtml(t.text)}</title>`
        : `<${t.tag} data-head ${Object.entries(t.attrs)
            .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
            .join(" ")} />`,
    )
    .join("\n    ");
}

/** Replaces the page's managed <head> tags in the browser (after client-side navigation). */
export function applyHead(tags: HeadTag[]): void {
  document.head.querySelectorAll("[data-head]").forEach((el) => el.remove());
  for (const t of tags) {
    if (t.tag === "title") {
      document.title = t.text;
      continue;
    }
    const el = document.createElement(t.tag);
    el.setAttribute("data-head", "");
    for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
}
