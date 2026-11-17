import { useEffect, useRef, useState } from "react";
import { useHydrated } from "./useHydrated";

// True once the element has scrolled into view; it stays true, so an entrance plays only once.
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  // Starts false on the server and in the browser alike; CSS only hides content while JS runs (html.js).
  const [inView, setInView] = useState(false);
  // Without IntersectionObserver there is nothing to wait for: show the final state once the page is live.
  const noObserver = useHydrated() && !("IntersectionObserver" in window);

  useEffect(() => {
    const element = ref.current;
    if (!element || inView || !("IntersectionObserver" in window)) return;
    const reveal = (entries: IntersectionObserverEntry[]) => {
      if (entries.some((entry) => entry.isIntersecting)) setInView(true);
    };
    // A share of the element: enough for anything shorter than the screen.
    const byElement = new IntersectionObserver(reveal, { threshold });
    // A share of the screen: an element taller than the screen may never show `threshold` of itself.
    const byScreen = new IntersectionObserver(reveal, {
      rootMargin: `0px 0px -${Math.round(threshold * 100)}% 0px`,
    });
    byElement.observe(element);
    byScreen.observe(element);
    return () => {
      byElement.disconnect();
      byScreen.disconnect();
    };
  }, [threshold, inView]);

  return [ref, inView || noObserver] as const;
}
