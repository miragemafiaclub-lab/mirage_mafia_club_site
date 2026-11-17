// Values fixed at build time by vite.config.ts.
declare const __SITE_URL__: string;
declare const __BUILD_TIME__: number;

/** Public address of the site without a trailing slash, e.g. https://mirage-mafia-club-site.vercel.app */
export const SITE_URL: string = __SITE_URL__;

/** When this build was made (ms). The prerendered HTML and the first browser render both use it as "now". */
export const BUILD_TIME: number = __BUILD_TIME__;

/** Full address for a path on this site: "/rating" → "https://…/rating". */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}
