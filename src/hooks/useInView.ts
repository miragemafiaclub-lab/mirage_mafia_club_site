import { useEffect, useRef, useState } from "react";

// True once the element has scrolled into view; it stays true, so an entrance plays only once.
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  // Without IntersectionObserver there is nothing to wait for: show the final state.
  const [inView, setInView] = useState(() => !("IntersectionObserver" in window));

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;
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

  return [ref, inView] as const;
}
