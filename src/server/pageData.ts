// Build-time only (imported by entry-server.tsx): the big data files never reach the browser bundle.
import { buildPlayerStats, type ProfileRecord } from "../data/playerStats";
import profilesJson from "../data/profiles.json";
import type { StoredRating } from "../data/rating";
import ratingJson from "../data/rating.json";
import { pageDataUrl } from "../pageDataUrl";
import type { Route } from "../routes";

const rating = ratingJson as StoredRating;
const profiles = profilesJson as unknown as Record<string, ProfileRecord>;

export function pageDataFor(route: Route): { url: string; data: unknown } | null {
  const url = pageDataUrl(route);
  if (!url) return null;
  if (route.page === "rating") return { url, data: rating };
  if (route.page === "player" && route.player.imafiaId) {
    return { url, data: buildPlayerStats(rating, profiles, route.player.imafiaId) };
  }
  return null;
}
