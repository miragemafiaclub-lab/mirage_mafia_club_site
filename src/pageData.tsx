import { type ReactNode } from "react";
import { CacheContext } from "./pageDataCache";

/**
 * Big data (the rating, a player's stats) is not part of the site's main script. The build writes it
 * into each page's HTML (<script id="page-data">) and as a file under /data/. A page that has it embedded
 * uses it straight away; after moving to another page in the browser, it is fetched from /data/.
 */

export function PageDataProvider({ cache, children }: { cache: Map<string, unknown>; children: ReactNode }) {
  return <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>;
}
