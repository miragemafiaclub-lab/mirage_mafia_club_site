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
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(el: Element) {
    this.targets.push(el);
    FakeObserver.live.add(this);
  }
  disconnect() {
    FakeObserver.live.delete(this);
  }
  static show(id: string) {
    for (const observer of FakeObserver.live) {
      const entries = observer.targets.map((target) => ({ target, isIntersecting: target.id === id }));
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
});
