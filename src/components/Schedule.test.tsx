// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Schedule from "./Schedule";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const card = () => container.querySelector(".schedule-next")!;
const click = (el: Element | null | undefined) => act(() => (el as HTMLElement).click());
const dayRow = (label: string) =>
  [...container.querySelectorAll("button.schedule-week__row")].find((row) => row.textContent?.startsWith(label));

beforeEach(() => {
  // Tuesday, 17 November 2026, 10:00 in Warsaw: tonight's open evening is the next game.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(Date.UTC(2026, 10, 17, 9, 0)));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  Element.prototype.scrollIntoView = vi.fn();
  act(() => {
    root.render(
      <MemoryRouter initialEntries={["/"]}>
        <Schedule />
      </MemoryRouter>,
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("schedule card", () => {
  it("shows the evening's price and a Telegram sign-up", () => {
    expect(card().textContent).toContain("50 zł · оплата в боте");
    expect(card().querySelector("a.schedule-next__cta")?.textContent).toContain("Записаться в Telegram");
  });

  it("on the invite-only captains' table, offers the nearest open evening instead of sign-up", () => {
    click(dayRow("Ср"));
    expect(card().textContent).toContain("Стол по приглашению");
    expect(card().querySelector("a.schedule-next__cta")).toBeNull();
    const alt = card().querySelector("button.schedule-next__alt");
    expect(alt?.textContent).toContain("Ближайший открытый вечер: сегодня, 17 ноября");
    click(alt);
    expect(card().querySelector(".schedule-next__date")?.textContent).toBe("17 ноября");
    expect(card().querySelector("a.schedule-next__cta")).not.toBeNull();
  });

  it("picks the next Newcomers' day from the line under the week, with a link to the first-visit guide", () => {
    click(container.querySelector(".schedule-week__hint"));
    expect(card().querySelector(".schedule-next__date")?.textContent).toBe("22 ноября");
    expect(card().querySelector(".schedule-next__more")?.getAttribute("href")).toBe("/first-time");
  });
});
