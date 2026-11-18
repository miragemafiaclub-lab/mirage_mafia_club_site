import { CLUB_PLAYERS, findPlayer, type ClubPlayer } from "./data/playerDirectory";
import { LANGS, type Lang } from "./i18n/lang";

/** Pages that are not the home page or a player profile. */
export type StaticPageId = "rating" | "tournaments" | "firstTime" | "compare";

export const STATIC_PAGES: Record<StaticPageId, string> = {
  rating: "/rating",
  tournaments: "/tournaments",
  firstTime: "/first-time",
  compare: "/compare",
};

export type Route =
  | { page: "home"; lang: Lang; path: "/" }
  | { page: StaticPageId; lang: Lang; path: string }
  | { page: "player"; lang: Lang; path: string; player: ClubPlayer }
  | { page: "notFound"; lang: Lang; path: string };

/** Russian lives at the plain path, English under /en: ("/rating", "en") → "/en/rating", ("/", "en") → "/en". */
export function localize(path: string, lang: Lang): string {
  if (lang === "ru") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** "/en/rating/" → { lang: "en", path: "/rating" }. Trailing slashes and repeated slashes are ignored. */
export function splitLang(pathname: string): { lang: Lang; path: string } {
  const clean = `/${pathname.split("/").filter(Boolean).join("/")}`;
  const match = clean.match(/^\/en(\/.*)?$/);
  if (match) return { lang: "en", path: match[1] ?? "/" };
  return { lang: "ru", path: clean };
}

/** The same page in the other language. */
export function switchLang(pathname: string, lang: Lang): string {
  return localize(splitLang(pathname).path, lang);
}

export function resolveRoute(pathname: string): Route {
  const { lang, path } = splitLang(pathname);
  if (path === "/") return { page: "home", lang, path: "/" };
  for (const [page, pagePath] of Object.entries(STATIC_PAGES) as [StaticPageId, string][]) {
    if (path === pagePath) return { page, lang, path };
  }
  const slug = path.match(/^\/players\/([^/]+)$/)?.[1];
  const player = slug ? findPlayer(decodeURIComponent(slug)) : undefined;
  if (player) return { page: "player", lang, path, player };
  return { page: "notFound", lang, path };
}

/** Every address that gets its own prerendered HTML file, in both languages. */
export function prerenderPaths(): string[] {
  const paths = ["/", ...Object.values(STATIC_PAGES), ...CLUB_PLAYERS.map((player) => `/players/${player.slug}`)];
  return LANGS.flatMap((lang) => paths.map((path) => localize(path, lang)));
}
