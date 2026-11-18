import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Router, UNSAFE_createBrowserHistory as createBrowserHistory, type Location, type NavigationType } from "react-router";
import { splitLang } from "./routes";

type HistoryState = { action: NavigationType; location: Location };

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

/** A cross-fade only when another page opens: not for a #section jump or the language switch on the same page. */
function opensAnotherPage(from: Location, to: Location) {
  return splitLang(from.pathname).path !== splitLang(to.pathname).path;
}

function canAnimate() {
  const doc = document as ViewTransitionDocument;
  return (
    typeof doc.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * BrowserRouter, plus a View Transition between pages (styles in motion.css). The page swap is
 * rendered synchronously inside document.startViewTransition, so the browser snapshots the old
 * page, then the new one already scrolled to its place by App. Without support, or with reduced
 * motion, pages simply change. The first render is the same as BrowserRouter's, so hydration is untouched.
 */
export default function TransitionRouter({ children }: { children: ReactNode }) {
  const [history] = useState(() => createBrowserHistory({ v5Compat: true }));
  const [state, setState] = useState<HistoryState>({ action: history.action, location: history.location });
  const shown = useRef(state.location);

  useLayoutEffect(
    () =>
      history.listen((next) => {
        const from = shown.current;
        shown.current = next.location;
        if (opensAnotherPage(from, next.location) && canAnimate()) {
          (document as ViewTransitionDocument).startViewTransition!(() => flushSync(() => setState(next)));
        } else {
          setState(next);
        }
      }),
    [history],
  );

  return (
    <Router location={state.location} navigationType={state.action} navigator={history}>
      {children}
    </Router>
  );
}
