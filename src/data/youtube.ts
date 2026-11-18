// The club's YouTube channel: latest videos and whether a stream is live right now.
// The data comes from /api/youtube (a Vercel function that holds the API key and caches for 5 minutes).

export const YOUTUBE_URL = "https://www.youtube.com/@mirage_mafia_club";
export const YOUTUBE_CHANNEL_ID = "UCXjQuqOmjqRRv7g7X3_jtUw";
/** The channel's "uploads" playlist: the channel id with UC → UU. Live streams show up here too. */
export const YOUTUBE_UPLOADS_ID = `UU${YOUTUBE_CHANNEL_ID.slice(2)}`;
export const YOUTUBE_API_URL = "/api/youtube";

export type YoutubeVideo = {
  id: string;
  title: string;
  /** ISO date: when it was published, or when a stream started / is scheduled to start. */
  date: string;
  thumb: string;
};

export type YoutubeFeed = {
  /** The stream that is on air now, if any. */
  live: YoutubeVideo | null;
  /** The nearest scheduled stream, if any. */
  upcoming: YoutubeVideo | null;
  /** Finished videos and past streams, newest first (Shorts left out). */
  latest: YoutubeVideo[];
};

export const videoUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

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
