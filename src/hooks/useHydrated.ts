import { useSyncExternalStore } from "react";
import { warsawNow } from "../data/schedule";
import { BUILD_TIME } from "../site";

const subscribe = () => () => {};

/**
 * False while React is turning the prerendered HTML into a live page, true right after.
 * Anything that depends on the visitor's clock or browser renders its final state only once this is true,
 * so the first render matches the HTML made at build time.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/** Warsaw wall-clock time: the build time in the prerendered HTML, the real time once the page is live. */
export function useClubNow(): Date {
  const hydrated = useHydrated();
  return hydrated ? warsawNow() : warsawNow(new Date(BUILD_TIME));
}
