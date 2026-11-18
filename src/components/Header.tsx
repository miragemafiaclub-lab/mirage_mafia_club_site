import { useEffect, useRef, useState, type ComponentProps, type FocusEvent } from "react";
import { Link } from "react-router";
import logo from "../assets/logo.jpeg";
import { TELEGRAM_URL } from "../data/schedule";
import { header, type NavId } from "../i18n/header";
import { LANGS, useLang, useT } from "../i18n/lang";
import { useRoute, useSectionHref } from "../RouteContext";
import { STATIC_PAGES, localize } from "../routes";
import "./Header.css";

const INSTAGRAM_URL = "https://instagram.com/mirage_mafia_club";
const NAV_IDS: NavId[] = ["about", "schedule", "players", "winners", "podium", "contact"];
/** Separate pages in the menu, each placed right after a home-page section. */
const PAGE_AFTER: Partial<Record<NavId, "firstTime" | "rating">> = { schedule: "firstTime", players: "rating" };
/** Sections watched by the scrollspy, in page order. "home" has no nav item: it just clears the highlight. */
const SPY_IDS = ["home", ...NAV_IDS];
/** Must match the burger breakpoint in Header.css. */
const DESKTOP_QUERY = "(min-width: 1361px)";
const MENU_ID = "header-menu";

/** A link to a home-page section: a plain anchor on the home page, a router link from other pages. */
function SectionLink({ section, ...props }: { section: string } & Omit<ComponentProps<"a">, "href">) {
  const onHome = useRoute().page === "home";
  const href = useSectionHref()(section);
  return onHome ? <a href={href} {...props} /> : <Link to={href} {...props} />;
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.5 3.5 2.8 10.9c-1.1.44-1.1 1.06-.2 1.34l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.8l3-14.1c.3-1.2-.4-1.7-1.2-1.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7.4 13.7 17.6 7l-8.3 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function LangSwitch({ className }: { className: string }) {
  const { lang, setLang } = useLang();
  const t = useT(header);
  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={t.langLabel}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          className="lang-switch__btn"
          lang={code}
          aria-pressed={lang === code}
          aria-label={`${code.toUpperCase()}, ${t.langNames[code]}`}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function SocialLinks({ className }: { className: string }) {
  const t = useT(header);
  return (
    <>
      <a className={className} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t.instagram}>
        <InstagramIcon />
      </a>
      <a className={className} href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={t.telegram}>
        <TelegramIcon />
      </a>
    </>
  );
}

/**
 * Id of the home-page section currently in the middle of the viewport (null on the hero or before any section).
 * Only the home page has these sections: elsewhere the footer (#contact) would light up "Contacts" next to the
 * current page's item, so the spy is off there and nothing is highlighted. `path` keys the result to one page view:
 * a highlight left from an earlier visit is never shown after coming back.
 */
function useActiveSection(enabled: boolean, path: string) {
  const [spied, setSpied] = useState<{ path: string; id: string } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const setActive = (id: string) => setSpied({ path, id });
    // Sections are siblings of the header, so they exist by the time this effect runs; missing ids are skipped.
    const sections = SPY_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const visible = new Set<string>();
    const pick = () => {
      // Near the very bottom the last (short) section may never reach the middle band.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      const current = sections.findLast((el) => visible.has(el.id));
      if (current) setActive(current.id);
    };

    // A thin band around the middle of the screen: the section crossing it is the active one.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        pick();
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((el) => observer.observe(el));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(pick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [enabled, path]);

  return enabled && spied?.path === path ? spied.id : null;
}

export default function Header() {
  const t = useT(header);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const route = useRoute();
  const active = useActiveSection(route.page === "home", route.path);

  // Another page shown without a menu click (browser Back/Forward): the menu must not stay open over it.
  const [menuPath, setMenuPath] = useState(route.path);
  if (menuPath !== route.path) {
    setMenuPath(route.path);
    setMenuOpen(false);
  }

  // While the menu is open: lock page scroll, close on Esc and when the window grows past the breakpoint.
  useEffect(() => {
    if (!menuOpen) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", onChange);

    return () => {
      body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // Tabbing out of the header leaves the overlay behind: close it so it never covers the focused element.
  const onHeaderBlur = (e: FocusEvent<HTMLElement>) => {
    // relatedTarget is null for clicks on non-focusable spots (and buttons in Safari) — keep the menu then.
    const next = e.relatedTarget;
    if (menuOpen && next instanceof Node && !e.currentTarget.contains(next)) setMenuOpen(false);
  };

  const navItems = (onClick?: () => void) =>
    NAV_IDS.flatMap((id) => {
      const item = (
        <li key={id}>
          <SectionLink section={id} aria-current={active === id ? "true" : undefined} onClick={onClick}>
            {t.nav[id]}
          </SectionLink>
        </li>
      );
      const page = PAGE_AFTER[id];
      if (!page) return [item];
      return [
        item,
        <li key={page}>
          <Link
            to={localize(STATIC_PAGES[page], route.lang)}
            aria-current={route.page === page ? "page" : undefined}
            onClick={onClick}
          >
            {t.pages[page]}
          </Link>
        </li>,
      ];
    });

  return (
    <header className={`header${menuOpen ? " is-menu-open" : ""}`} onBlur={onHeaderBlur}>
      <a className="header__skip" href="#main">
        {t.skip}
      </a>

      <SectionLink className="header__brand" section="home" aria-label={t.homeLabel} onClick={closeMenu}>
        <img className="header__logo" src={logo} alt={t.logoAlt} />
      </SectionLink>

      <nav className="header__nav" aria-label={t.navLabel}>
        <ul>{navItems()}</ul>
      </nav>

      <div className="header__actions">
        <SocialLinks className="header__social" />
        <LangSwitch className="header__lang" />
        <SectionLink className="header__cta" section="schedule" onClick={closeMenu}>
          <span className="header__cta-full">{t.cta}</span>
          <span className="header__cta-short">{t.ctaShort}</span>
          <span aria-hidden="true">→</span>
        </SectionLink>
        <button
          ref={burgerRef}
          type="button"
          className="header__burger"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          aria-label={menuOpen ? t.menuClose : t.menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="header__burger-lines" aria-hidden="true" />
        </button>
      </div>

      <div className="header__menu" id={MENU_ID} inert={!menuOpen}>
        <nav aria-label={t.menuLabel}>
          <ul className="header__menu-links">{navItems(closeMenu)}</ul>
        </nav>
        <div className="header__menu-footer">
          <SectionLink className="header__cta header__menu-cta" section="schedule" onClick={closeMenu}>
            {t.cta} <span aria-hidden="true">→</span>
          </SectionLink>
          <div className="header__menu-row">
            <div className="header__menu-socials">
              <SocialLinks className="header__social" />
            </div>
            <LangSwitch className="header__menu-lang" />
          </div>
        </div>
      </div>
    </header>
  );
}
