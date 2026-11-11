import { CLUB_PLACE, SIGNUP_URL } from "../data/schedule";
import { footer } from "../i18n/footer";
import { useT } from "../i18n/lang";
import "./Footer.css";

const INSTAGRAM_URL = "https://instagram.com/mirage_mafia_club";
const IMAFIA_URL = "https://imafia.org/club/35";

// Street part only ("Ludna 2"); the floor is localized from the dictionary.
const STREET = CLUB_PLACE.address.split(",")[0];
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${STREET}, Warszawa`)}`;

export default function Footer() {
  const t = useT(footer);
  const links = [
    { href: SIGNUP_URL, label: t.telegram },
    { href: INSTAGRAM_URL, label: t.instagram },
    { href: IMAFIA_URL, label: t.imafia },
  ];

  return (
    <footer className="footer" id="contact">
      <div className="footer__inner">
        <div className="footer__brand">
          <p className="footer__name">Mirage Mafia Club</p>
          <p className="footer__tagline">{t.tagline}</p>
        </div>

        <div className="footer__col">
          <h2 className="footer__title">{t.addressTitle}</h2>
          <address className="footer__address">
            {STREET}, {t.floor}
            <br />
            {t.city}
          </address>
          <a className="footer__link" href={MAP_URL} target="_blank" rel="noopener noreferrer">
            {t.mapLabel} <span aria-hidden="true">↗</span>
            <span className="footer__sr">{t.newTab}</span>
          </a>
        </div>

        <div className="footer__col">
          <h2 className="footer__title">{t.contactTitle}</h2>
          <ul className="footer__links">
            {links.map((link) => (
              <li key={link.href}>
                <a className="footer__link" href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label} <span aria-hidden="true">↗</span>
                  <span className="footer__sr">{t.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="footer__copy">
        © {new Date().getFullYear()} Mirage Mafia Club. {t.rights}
      </p>
    </footer>
  );
}
