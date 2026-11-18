// @vitest-environment jsdom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate, type NavigateFunction } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Stands in for the browser's IntersectionObserver: the test says which watched sections are in the middle band. */
class FakeObserver {
  static live = new Set<FakeObserver>();
  targets: Element[] = [];
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
  }
  observe(el: Element) {
    this.targets.push(el);
    FakeObserver.live.add(this);
  }
  disconnect() {
    this.targets = [];
    FakeObserver.live.delete(this);
  }
  /** Like the browser, a node no longer in the document never intersects. */
  static show(...ids: string[]) {
    for (const observer of [...FakeObserver.live]) {
      const entries = observer.targets.map((target) => ({ target, isIntersecting: target.isConnected && ids.includes(target.id) }));
      observer.callback(entries as unknown as IntersectionObserverEntry[], observer as unknown as IntersectionObserver);
    }
  }
}

let container: HTMLDivElement;
let root: Root;
let go: NavigateFunction;

function Nav() {
  const navigate = useNavigate();
  useEffect(() => {
    go = navigate;
  });
  return null;
}

function mount(path: string) {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Nav />
        <App />
      </MemoryRouter>,
    );
  });
}

/** Desktop menu items marked as current: "true" for the scrollspy's section, "page" for the page being shown. */
const current = () =>
  [...container.querySelectorAll(".header__nav [aria-current]")].map((a) => `${a.textContent}:${a.getAttribute("aria-current")}`);

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  // Far from the bottom of the page, so the spy follows the observer rather than the "at the very bottom" rule.
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 100_000 });
  window.scrollTo = vi.fn() as typeof window.scrollTo;
  Element.prototype.scrollTo = vi.fn() as typeof Element.prototype.scrollTo;
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  FakeObserver.live.clear();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("header scrollspy", () => {
  it("highlights the home-page section in view", () => {
    mount("/");
    act(() => FakeObserver.show("about"));
    expect(current()).toEqual(["О клубе:true"]);
  });

  it("is off on other pages: reaching the footer does not light up Contacts next to the current page", () => {
    mount("/rating");
    expect(FakeObserver.live.size).toBe(0);
    act(() => FakeObserver.show("contact"));
    expect(current()).toEqual(["Рейтинг:page"]);
  });

  it("forgets the old highlight after leaving the home page and coming back", () => {
    mount("/");
    act(() => FakeObserver.show("players"));
    expect(current()).toEqual(["Игроки:true"]);

    act(() => go("/rating"));
    expect(current()).toEqual(["Рейтинг:page"]);

    act(() => go("/"));
    expect(current()).toEqual([]);
  });

  it("watches a band from under the header to 40% of the screen", () => {
    mount("/");
    const [observer] = FakeObserver.live;
    expect(observer.options?.rootMargin).toMatch(/^-\d+px 0px -60% 0px$/);
  });

  it("with two sections in the band, the lower one (whose top has passed the band's edge) is current", () => {
    mount("/");
    act(() => FakeObserver.show("about", "schedule"));
    expect(current()).toEqual(["Расписание:true"]);
  });

  it("follows a section rendered anew after it started watching (Schedule's build-time markup swapped for the live one)", () => {
    mount("/");
    const old = container.querySelector("#schedule")!;
    old.replaceWith(old.cloneNode(true));
    // The first report comes from the detached node: the spy re-points the observer at the new one.
    act(() => FakeObserver.show("about", "schedule"));
    act(() => FakeObserver.show("about", "schedule"));
    expect(current()).toEqual(["Расписание:true"]);
  });
});

describe("header after a page change", () => {
  it("holds hover styles until the pointer moves, so the item under a resting pointer is not underlined", () => {
    mount("/first-time");
    const header = () => container.querySelector(".header")!;
    act(() => window.dispatchEvent(new Event("pointermove")));
    expect(header().classList.contains("is-pointer-idle")).toBe(false);

    act(() => go("/"));
    expect(header().classList.contains("is-pointer-idle")).toBe(true);
    expect(current()).toEqual([]);

    act(() => window.dispatchEvent(new Event("pointermove")));
    expect(header().classList.contains("is-pointer-idle")).toBe(false);
  });
});

describe("skip link", () => {
  it.each(["/", "/rating", "/first-time", "/players/ace", "/no-such-page"])("moves focus to #main on %s", (path) => {
    mount(path);
    const main = container.querySelector<HTMLElement>("#main");
    expect(main).not.toBeNull();
    const skip = container.querySelector<HTMLAnchorElement>(".header__skip")!;
    expect(skip.getAttribute("href")).toBe("#main");
    act(() => skip.click());
    expect(document.activeElement).toBe(main);
  });
});
