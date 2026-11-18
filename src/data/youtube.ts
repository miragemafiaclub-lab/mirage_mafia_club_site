// The club's YouTube channel: latest videos and whether a stream is live right now.
// The data comes from /api/youtube (api/youtube.ts: a Vercel function that holds the API key and caches for
// 5 minutes). This file is for the page; the parsing lives with the function.

export const YOUTUBE_URL = "https://www.youtube.com/@mirage_mafia_club";
export const YOUTUBE_CHANNEL_ID = "UCXjQuqOmjqRRv7g7X3_jtUw";
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
