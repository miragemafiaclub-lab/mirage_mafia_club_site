import type { Route } from "./routes";

/** Where a page's data lives, or null for pages without any. */
export function pageDataUrl(route: Route): string | null {
  if (route.page === "rating") return "/data/rating.json";
  if (route.page === "player" && route.player.imafiaId) return `/data/players/${route.player.slug}.json`;
  return null;
}

/** Reads the data the build embedded in this page, if any. */
export function readEmbeddedPageData(): Map<string, unknown> {
  const cache = new Map<string, unknown>();
  const script = document.getElementById("page-data");
  if (script?.textContent) {
    try {
      const { url, data } = JSON.parse(script.textContent) as { url: string; data: unknown };
      cache.set(url, data);
    } catch {
      // A broken embed only means the page fetches its data instead.
    }
  }
  return cache;
}
