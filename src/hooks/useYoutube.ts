import { useEffect, useState } from "react";
import { YOUTUBE_API_URL, type YoutubeFeed } from "../data/youtube";

// One request per page load, shared by the header badge and the home section.
let request: Promise<YoutubeFeed | null> | null = null;

function load(): Promise<YoutubeFeed | null> {
  request ??= fetch(YOUTUBE_API_URL)
    .then((res) => (res.ok ? (res.json() as Promise<YoutubeFeed>) : null))
    .then((feed) => (feed && Array.isArray(feed.latest) ? feed : null))
    .catch(() => null);
  return request;
}

/**
 * The channel feed once the page is live: undefined while loading (and in the prerendered HTML), null when it
 * could not be loaded (no API key, local dev, YouTube down), the feed otherwise.
 */
export function useYoutube(): YoutubeFeed | null | undefined {
  const [feed, setFeed] = useState<YoutubeFeed | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    load().then((result) => alive && setFeed(result));
    return () => {
      alive = false;
    };
  }, []);
  return feed;
}
