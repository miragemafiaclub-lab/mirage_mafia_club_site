import aboutAccent from "../assets/about-accent.jpeg";
import aboutAwards from "../assets/about-awards.jpeg";
import aboutGroup from "../assets/about-group.jpeg";
import aboutMain from "../assets/about-main.jpeg";
import aboutPodium from "../assets/about-podium.jpeg";
import aboutSmall from "../assets/about-small.jpeg";
import aboutTrophies from "../assets/about-trophies.jpeg";
import { CLUB_STATS } from "../data/clubStats";
import { about } from "../i18n/about";
import { useT } from "../i18n/lang";
import "./About.css";

const IMAFIA_URL = "https://imafia.org/club/35";

const PHOTO_COLUMNS = [
  [
    { src: aboutAwards, ratio: 960 / 1280, alt: "awards" },
    { src: aboutSmall, ratio: 589 / 690, alt: "small" },
  ],
  [
    { src: aboutTrophies, ratio: 1280 / 853, alt: "trophies" },
    { src: aboutMain, ratio: 1206 / 817, alt: "main", accent: true },
    { src: aboutAccent, ratio: 1280 / 853, alt: "accent" },
  ],
  [
    { src: aboutPodium, ratio: 914 / 1280, alt: "podium" },
    { src: aboutGroup, ratio: 1.15, alt: "group" },
  ],
] as const;

export default function About() {
  const t = useT(about);
  const stats = [
    { key: "players", value: CLUB_STATS.players, ...t.stats.players },
    { key: "perWeek", value: CLUB_STATS.gamesPerWeek, ...t.stats.perWeek },
    { key: "wins", value: CLUB_STATS.tournamentWins, ...t.stats.wins },
    { key: "venue", value: CLUB_STATS.venue, ...t.stats.venue },
    { key: "school", ...t.stats.school },
  ];

  return (
    <section className="about" id="about">
      <p className="about__eyebrow">{t.eyebrow}</p>

      <div className="about__grid">
        <div className="about__content">
          <h2 className="about__title">
            {t.titleLine1}{" "}
            <br />
            {t.titleLine2}<span className="about__title-mark">!</span>
          </h2>

          <p className="about__lead">{t.founded}</p>

          <p className="about__lead about__badge">
            <svg
              className="about__badge-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span>
              <span className="about__accent">{t.awardAccent}</span>
              {t.awardRest}
            </span>
          </p>

          <p className="about__lead">{t.residents}</p>

          <p className="about__lead">{t.rhythm}</p>

          <div className="about__actions">
            <a className="about__btn about__btn--primary" href="#schedule">
              {t.cta} <span aria-hidden="true">→</span>
            </a>
            <a
              className="about__link"
              href={IMAFIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.imafiaLinkLabel}
            >
              {t.imafiaLink} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="about__visual">
          <div className="about__photos">
            {PHOTO_COLUMNS.map((column, colIndex) => (
              <div
                className={`about__photos-col${colIndex > 0 ? ` about__photos-col--offset-${colIndex}` : ""}`}
                key={colIndex}
              >
                {column.map((photo) => (
                  <div className={`about__frame${"accent" in photo ? " about__frame--accent" : ""}`} key={photo.src}>
                    <img
                      src={photo.src}
                      alt={t.alts[photo.alt]}
                      style={{ aspectRatio: photo.ratio }}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <dl className="about__stats">
        {stats.map((stat) => (
          <div className="about__stat" key={stat.key}>
            <dt>{stat.value}</dt>
            <dd className="about__stat-label">{stat.label}</dd>
            <dd className="about__stat-sub">{stat.sub}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
