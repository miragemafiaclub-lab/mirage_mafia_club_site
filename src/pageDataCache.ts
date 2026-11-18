import { createContext, useContext, useEffect, useState } from "react";

/** Page data already in hand, by URL (see pageData.tsx). */
export const CacheContext = createContext<Map<string, unknown>>(new Map());

/** The data at `url`: right away if this page brought it, otherwise after a fetch (undefined meanwhile). */
export function usePageData<T>(url: string | null): { data: T | undefined; failed: boolean } {
  const cache = useContext(CacheContext);
  const [, rerender] = useState(0);
  const [failed, setFailed] = useState(false);
  const data = url ? (cache.get(url) as T | undefined) : undefined;

  useEffect(() => {
    if (!url || cache.has(url)) return;
    let cancelled = false;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${url}: ${response.status}`);
        return response.json();
      })
      .then((json) => {
        cache.set(url, json);
        if (!cancelled) rerender((n) => n + 1);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url, cache]);

  return { data, failed: failed && !data };
}

