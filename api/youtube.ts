// Vercel function: the club's latest YouTube videos and live status.
// Costs 2 units of the free 10 000/day YouTube quota per call (playlistItems + videos); the CDN caches the
// answer for 5 minutes, so at most ~600 units a day. The key lives only in the YOUTUBE_API_KEY env variable.

// Self-contained on purpose: the package is ESM, and Vercel's Node runtime can't resolve an extensionless
// relative import at run time. The only import is type-only, so it is erased when compiled.
import type { YoutubeFeed, YoutubeVideo } from "../src/data/youtube";

const CHANNEL_ID = "UCXjQuqOmjqRRv7g7X3_jtUw";
/** The channel's "uploads" playlist: the channel id with UC → UU. Live streams show up here too. */
export const UPLOADS_ID = `UU${CHANNEL_ID.slice(2)}`;

const API = "https://www.googleapis.com/youtube/v3";

export async function GET(): Promise<Response> {
  // Read through globalThis so this file needs no Node type definitions.
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const key = env.YOUTUBE_API_KEY;
  if (!key) return Response.json({ error: "not configured" }, { status: 503 });

  try {
    const list = await fetch(
      `${API}/playlistItems?part=contentDetails&maxResults=15&playlistId=${UPLOADS_ID}&key=${key}`,
    );
    if (!list.ok) throw new Error(`playlistItems ${list.status}`);
    const ids = ((await list.json()).items ?? [])
      .map((item: { contentDetails?: { videoId?: string } }) => item.contentDetails?.videoId)
      .filter(Boolean)
      .join(",");

    const videos = await fetch(
      `${API}/videos?part=snippet,contentDetails,liveStreamingDetails&id=${ids}&key=${key}`,
    );
    if (!videos.ok) throw new Error(`videos ${videos.status}`);
    const items: ApiVideo[] = (await videos.json()).items ?? [];

    return Response.json(buildFeed(items), {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    // Never echo the URL (it holds the key): only the status line.
    console.error("youtube:", error instanceof Error ? error.message : "failed");
    return Response.json({ error: "upstream" }, { status: 502, headers: { "Cache-Control": "s-maxage=60" } });
  }
}

/** The parts of a YouTube Data API `videos` item the site uses. */
export type ApiVideo = {
  id: string;
  snippet?: {
    title?: string;
    publishedAt?: string;
    liveBroadcastContent?: string;
    thumbnails?: Record<string, { url?: string; width?: number } | undefined>;
  };
  contentDetails?: { duration?: string };
  liveStreamingDetails?: { actualStartTime?: string; scheduledStartTime?: string };
};

/** "PT1H2M3S" → seconds; 0 for a live/unknown duration. */
export function durationSeconds(iso: string | undefined): number {
  const m = iso?.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  return ((d * 24 + h) * 60 + min) * 60 + s;
}

function thumbOf(video: ApiVideo): string {
  const t = video.snippet?.thumbnails ?? {};
  return t.high?.url ?? t.medium?.url ?? t.standard?.url ?? t.default?.url ?? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
}

/** Shapes the API's `videos` items (in upload order) into what the page shows. */
export function buildFeed(items: ApiVideo[], latestCount = 3): YoutubeFeed {
  let live: YoutubeVideo | null = null;
  let upcoming: YoutubeVideo | null = null;
  const latest: YoutubeVideo[] = [];
  for (const item of items) {
    const kind = item.snippet?.liveBroadcastContent ?? "none";
    const base = { id: item.id, title: item.snippet?.title ?? "", thumb: thumbOf(item) };
    if (kind === "live") {
      live ??= { ...base, date: item.liveStreamingDetails?.actualStartTime ?? item.snippet?.publishedAt ?? "" };
    } else if (kind === "upcoming") {
      const date = item.liveStreamingDetails?.scheduledStartTime ?? item.snippet?.publishedAt ?? "";
      if (!upcoming || date < upcoming.date) upcoming = { ...base, date };
    } else {
      // Shorts (up to 3 minutes since 2024) are vertical clips, not games: leave them out.
      const seconds = durationSeconds(item.contentDetails?.duration);
      if (seconds > 0 && seconds <= 180) continue;
      if (latest.length < latestCount) latest.push({ ...base, date: item.snippet?.publishedAt ?? "" });
    }
  }
  return { live, upcoming, latest };
}
