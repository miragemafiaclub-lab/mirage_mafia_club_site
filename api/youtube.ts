// Vercel function: the club's latest YouTube videos and live status.
// Costs 2 units of the free 10 000/day YouTube quota per call (playlistItems + videos); the CDN caches the
// answer for 5 minutes, so at most ~600 units a day. The key lives only in the YOUTUBE_API_KEY env variable.

import { YOUTUBE_UPLOADS_ID, buildFeed, type ApiVideo } from "../src/data/youtube";

const API = "https://www.googleapis.com/youtube/v3";

export async function GET(): Promise<Response> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return Response.json({ error: "not configured" }, { status: 503 });

  try {
    const list = await fetch(
      `${API}/playlistItems?part=contentDetails&maxResults=15&playlistId=${YOUTUBE_UPLOADS_ID}&key=${key}`,
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
