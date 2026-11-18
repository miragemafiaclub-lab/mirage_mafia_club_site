import { describe, expect, it } from "vitest";
import { UPLOADS_ID, buildFeed, durationSeconds, type ApiVideo } from "../../api/youtube";
import { YOUTUBE_CHANNEL_ID } from "./youtube";

const video = (id: string, kind: string, extra: Partial<ApiVideo> = {}): ApiVideo => ({
  id,
  snippet: { title: `t${id}`, publishedAt: `2026-11-${id.padStart(2, "0")}T18:00:00Z`, liveBroadcastContent: kind },
  contentDetails: { duration: "PT2H10M" },
  ...extra,
});

describe("youtube feed", () => {
  it("reads ISO durations", () => {
    expect(durationSeconds("PT2H10M5S")).toBe(7805);
    expect(durationSeconds("PT45S")).toBe(45);
    expect(durationSeconds("P0D")).toBe(0);
    expect(durationSeconds(undefined)).toBe(0);
  });

  it("uses the channel's uploads playlist", () => {
    expect(UPLOADS_ID).toBe("UUXjQuqOmjqRRv7g7X3_jtUw");
    expect(UPLOADS_ID.slice(2)).toBe(YOUTUBE_CHANNEL_ID.slice(2));
  });

  it("splits the stream on air, the next scheduled one and the latest videos", () => {
    const feed = buildFeed([
      video("9", "upcoming", { liveStreamingDetails: { scheduledStartTime: "2026-11-25T17:30:00Z" } }),
      video("8", "upcoming", { liveStreamingDetails: { scheduledStartTime: "2026-11-21T17:30:00Z" } }),
      video("7", "live", { liveStreamingDetails: { actualStartTime: "2026-11-18T17:30:00Z" } }),
      video("6", "none"),
      video("5", "none"),
      video("4", "none"),
      video("3", "none"),
    ]);
    expect(feed.live).toMatchObject({ id: "7", date: "2026-11-18T17:30:00Z" });
    expect(feed.upcoming).toMatchObject({ id: "8" });
    expect(feed.latest.map((v) => v.id)).toEqual(["6", "5", "4"]);
  });

  it("leaves out Shorts and falls back to YouTube's own thumbnail", () => {
    const feed = buildFeed([video("2", "none", { contentDetails: { duration: "PT58S" } }), video("1", "none")]);
    expect(feed.latest.map((v) => v.id)).toEqual(["1"]);
    expect(feed.latest[0].thumb).toBe("https://i.ytimg.com/vi/1/hqdefault.jpg");
    expect(feed.live).toBeNull();
  });
});
