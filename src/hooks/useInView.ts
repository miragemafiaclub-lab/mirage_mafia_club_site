import { useEffect, useRef, useState } from "react";

// True once the element has scrolled into view; it stays true, so an entrance plays only once.
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  // Without IntersectionObserver there is nothing to wait for: show the final state.
  const [inView, setInView] = useState(() => !("IntersectionObserver" in window));

  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, inView]);

  return [ref, inView] as const;
}
