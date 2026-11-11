import logo from "../assets/logo.jpeg";
import "./Header.css";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Players", href: "#players" },
  { label: "Winners", href: "#winners" },
  { label: "Podium", href: "#podium" },
  { label: "Schedule", href: "#schedule" },
  { label: "Rules", href: "#rules" },
  { label: "Contact", href: "#contact" },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

export default function Header() {
  return (
    <header className="header">
      <a className="header__brand" href="#home">
        <img className="header__logo" src={logo} alt="Mirage Mafia Club logo" />
      </a>

      <nav className="header__nav" aria-label="Primary">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header__actions">
        <a className="header__social" href="#" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a className="header__social" href="#" aria-label="Telegram">
          <TelegramIcon />
        </a>
        <a className="header__cta" href="#join">
          Join the game <span aria-hidden="true">→</span>
        </a>
      </div>
    </header>
  );
}
