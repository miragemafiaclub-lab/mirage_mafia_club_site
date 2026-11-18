import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// A build that ran on the 1st of a month (the daily data sync runs at 05:00 UTC). The prerender runs on
// Vercel in UTC; the browser hydrates the same HTML in the visitor's own time zone. Anything derived from
// BUILD_TIME must come out the same in both, or React throws a hydration mismatch (#418) for the visitor.
const NEW_YEAR_BUILD = Date.UTC(2027, 0, 1, 5);

vi.mock("../site", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../site")>()),
  BUILD_TIME: NEW_YEAR_BUILD,
}));

const ZONES = ["UTC", "Europe/Warsaw", "America/Los_Angeles", "Pacific/Kiritimati"];
async function renderIn(zone: string, load: () => Promise<{ default: () => ReactNode }>) {
  // Node picks up a new TZ at once, so each import below computes its dates in that zone.
  vi.stubEnv("TZ", zone);
  vi.resetModules();
  const { default: Component } = await load();
  return renderToString(<Component />);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("build-time dates do not depend on the visitor's time zone", () => {
  it("footer year", async () => {
    const html: string[] = [];
    for (const zone of ZONES) html.push(await renderIn(zone, () => import("./Footer")));
    for (const h of html) expect(h).toBe(html[0]);
    // The club's (Warsaw) calendar: already 2027 there.
    expect(html[0]).toContain("2027");
  });

  it("winners month list", async () => {
    const html: string[] = [];
    for (const zone of ZONES) html.push(await renderIn(zone, () => import("./Winners")));
    for (const h of html) expect(h).toBe(html[0]);
  });
});
