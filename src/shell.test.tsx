// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let current = "";

/** Reports the router's address, like the browser's address bar. */
function Spy() {
  const loc = useLocation();
  current = loc.pathname + loc.search + loc.hash;
  return null;
}

function mount(entries: string[]) {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
        <Spy />
        <App />
      </MemoryRouter>,
    );
  });
}

const click = (el: Element | null) => act(() => (el as HTMLElement).click());

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  window.scrollTo = vi.fn() as typeof window.scrollTo;
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as never;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  document.body.style.overflow = "";
  localStorage.clear();
});

describe("language switch", () => {
  it("keeps the query string, so a comparison or a chosen rating table survives the switch", () => {
    mount(["/tournaments?league=chk&season=2026#top"]);
    click(container.querySelector('.header__lang button[lang="en"]'));
    expect(current).toBe("/en/tournaments?league=chk&season=2026#top");
  });

  it("does not jump to the top: it is the same page in the other language", () => {
    mount(["/tournaments"]);
    click(container.querySelector('.header__lang button[lang="en"]'));
    expect(current).toBe("/en/tournaments");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
