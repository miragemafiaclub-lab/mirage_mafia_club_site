import { useEffect, useRef, useState, type FocusEvent } from "react";
import logo from "../assets/logo.jpeg";
import { SIGNUP_URL } from "../data/schedule";
import { header, type NavId } from "../i18n/header";
import { LANGS, useLang, useT } from "../i18n/lang";
import "./Header.css";

const INSTAGRAM_URL = "https://instagram.com/mirage_mafia_club";
const NAV_IDS: NavId[] = ["about", "schedule", "players", "winners", "podium", "contact"];
/** Sections watched by the scrollspy, in page order. "home" has no nav item: it just clears the highlight. */
const SPY_IDS = ["home", ...NAV_IDS];
/** Must match the burger breakpoint in Header.css. */
const DESKTOP_QUERY = "(min-width: 1101px)";
const MENU_ID = "header-menu";

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
      <a className={className} href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" aria-label={t.telegram}>
        <TelegramIcon />
      </a>
    </>
  );
}

/** Id of the section currently in the middle of the viewport (null on the hero or before any section). */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return active;
}

export default function Header() {
  const t = useT(header);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const active = useActiveSection();

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
    NAV_IDS.map((id) => (
      <li key={id}>
        <a href={`#${id}`} aria-current={active === id ? "true" : undefined} onClick={onClick}>
          {t.nav[id]}
        </a>
      </li>
    ));

  return (
    <header className={`header${menuOpen ? " is-menu-open" : ""}`} onBlur={onHeaderBlur}>
      <a className="header__skip" href="#main">
        {t.skip}
      </a>

      <a className="header__brand" href="#home" aria-label={t.homeLabel} onClick={closeMenu}>
        <img className="header__logo" src={logo} alt={t.logoAlt} />
      </a>

      <nav className="header__nav" aria-label={t.navLabel}>
        <ul>{navItems()}</ul>
      </nav>

      <div className="header__actions">
        <SocialLinks className="header__social" />
        <LangSwitch className="header__lang" />
        <a className="header__cta" href="#schedule" onClick={closeMenu}>
          <span className="header__cta-full">{t.cta}</span>
          <span className="header__cta-short">{t.ctaShort}</span>
          <span aria-hidden="true">→</span>
        </a>
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
          <a className="header__cta header__menu-cta" href="#schedule" onClick={closeMenu}>
            {t.cta} <span aria-hidden="true">→</span>
          </a>
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
