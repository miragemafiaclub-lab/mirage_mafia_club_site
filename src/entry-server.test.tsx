import { describe, expect, it } from "vitest";
import { prerenderPaths, render } from "./entry-server";

// The same rendering the build does: every page must come out as real HTML, not an empty shell.
describe("prerender", () => {
  it.each(prerenderPaths())("%s renders with a heading and its own head tags", (path) => {
    const page = render(path);
    expect(page.html).toContain("<h1");
    expect(page.head).toContain("<title>");
    expect(page.head).toContain('rel="canonical"');
    expect(page.lang).toBe(path.startsWith("/en") ? "en" : "ru");
  });

  it("puts the real content into the home page HTML", () => {
    const { html } = render("/");
    expect(html).toContain('id="schedule"');
    expect(html).toContain('id="players"');
    expect(html).toContain("players-card");
  });

  it("shows the club records under the rating, in both languages", () => {
    expect(render("/rating").html).toContain("Рекорды клуба");
    expect(render("/en/rating").html).toContain("Club records");
  });

  it("puts the whole first-visit guide into the HTML, in both languages", () => {
    const ru = render("/first-time");
    expect(ru.noindex).toBe(false);
    expect(ru.html).toContain("Ludna 2");
    expect(ru.html).toContain("60 zł");
    expect(ru.html).toContain("https://learnmafia.com");
    expect(ru.html).toContain("https://t.me/mirage_mafia_club_bot");
    expect(ru.html).toContain("https://t.me/+0o-Bcqa-NkFhNzcy");
    expect(ru.html).toContain("https://learnmafia.com/knowledge/terminology");
    expect(ru.html).toContain("Вторник и пятница, 18:30");
    expect(render("/en/first-time").html).toContain("Tuesday and Friday, 18:30");
  });

  it("links the home page to the first-visit guide", () => {
    expect(render("/").html).toContain('href="/first-time"');
    expect(render("/en").html).toContain('href="/en/first-time"');
  });

  it("leads every sign-up to the club bot and keeps the channel as news", () => {
    const ru = render("/").html;
    expect(ru).toContain("Запись на игры — бот в Telegram");
    expect(ru).toContain("Telegram-канал — новости клуба");
    expect(ru).toContain('href="https://t.me/mirage_mafia_club"');
    expect(ru).not.toContain("Telegram — запись на игры");
    const en = render("/en").html;
    expect(en).toContain("Sign up for games — Telegram bot");
    expect(en).toContain("Telegram channel — club news");
  });

  it("closes the home page with the next game, the price and a sign-up through the bot", () => {
    const ru = render("/").html;
    expect(ru).toContain('class="closing-cta"');
    expect(ru).toContain("Записаться через бот");
    expect(ru).toContain("от 50 zł");
    expect(ru).toContain("Записаться в Telegram");
    expect(ru).toContain("оплата в боте");
    expect(ru).toContain("Впервые? Приходите в воскресенье на День новичка");
    expect(ru).toContain("Командная игра на логику и блеф");
    expect(render("/en").html).toContain("from 50 zł");
    // Home only: the guide page has its own call to action.
    expect(render("/first-time").html).not.toContain('class="closing-cta"');
  });

  it("does not promise a sign-up-free first visit, and names the map link by its text", () => {
    const ru = render("/first-time").html;
    expect(ru).toContain("без регистрации на iMafia");
    expect(ru).not.toContain("без регистрации на сайтах");
    expect(ru).toContain('aria-label="Открыть на карте (Google Maps, в новой вкладке)"');
    expect(render("/en/first-time").html).toContain('aria-label="Open the map (Google Maps, in a new tab)"');
  });

  it("renders a player's profile with their nick", () => {
    expect(render("/players/walle").html).toContain(">Walle<");
  });
});
