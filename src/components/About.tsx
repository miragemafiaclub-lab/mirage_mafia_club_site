import aboutAccent from "../assets/about-accent.jpeg";
import aboutAwards from "../assets/about-awards.jpeg";
import aboutGroup from "../assets/about-group.jpeg";
import aboutMain from "../assets/about-main.jpeg";
import aboutPodium from "../assets/about-podium.jpeg";
import aboutSmall from "../assets/about-small.jpeg";
import aboutTrophies from "../assets/about-trophies.jpeg";
import "./About.css";

const PHOTO_COLUMNS = [
  [
    { src: aboutAwards, ratio: 960 / 1280, alt: "Резиденты клуба Mirage с наградами Kraków Supreme Cup" },
    { src: aboutSmall, ratio: 589 / 690, alt: "Игрок клуба Mirage в маске за столом" },
  ],
  [
    { src: aboutTrophies, ratio: 1280 / 853, alt: "Победители турнира клуба Mirage" },
    { src: aboutMain, ratio: 1206 / 817, alt: "Резиденты клуба Mirage с наградами", accent: true },
    { src: aboutAccent, ratio: 1280 / 853, alt: "Игроки клуба Mirage" },
  ],
  [
    { src: aboutPodium, ratio: 914 / 1280, alt: "Победители турнира клуба Mirage с кубками" },
    { src: aboutGroup, ratio: 1.15, alt: "Резиденты клуба Mirage на прогулке по Варшаве" },
  ],
];

const STATS = [
  { value: "70+", label: "Players", sub: "игроков в клубе" },
  { value: "4-5×", label: "A week", sub: "игровых вечеров" },
  { value: "100+", label: "Tournament wins", sub: "побед на турнирах" },
  { value: "Ludna 2", label: "Own venue", sub: "своё помещение в центре Варшавы" },
  { value: "Mafia School", label: "Education", sub: "школа мафии" },
];

export default function About() {
  return (
    <section className="about" id="about">
      <p className="about__eyebrow">More than a game</p>

      <div className="about__grid">
        <div className="about__content">
          <h2 className="about__title">
            Mirage — клуб спортивной
            <br />
            мафии в Варшаве<span className="about__title-mark">!</span>
          </h2>

          <p className="about__lead">Дата создания клуба — 28.08.2023г</p>

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
              <span className="about__accent">Лучший клуб 2025 года</span> по версии iMafia.
            </span>
          </p>

          <p className="about__lead">
            В состав резидентов клуба входят одни из сильнейших игроков в мафию, которые занимают
            призовые места на международных турнирах.
          </p>

          <p className="about__lead">
            Мы играем 4-5 раз в неделю, постоянно проводим клубные серии и мини турниры.
            Развиваемся и растем вместе!
          </p>

          <div className="about__actions">
            <a
              className="about__btn about__btn--primary"
              href="https://imafia.org/club/35#club-info"
              target="_blank"
              rel="noreferrer"
            >
              Стать частью клуба <span aria-hidden="true">→</span>
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
                  <div className={`about__frame${photo.accent ? " about__frame--accent" : ""}`} key={photo.src}>
                    <img src={photo.src} alt={photo.alt} style={{ aspectRatio: photo.ratio }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <dl className="about__stats">
        {STATS.map((stat) => (
          <div className="about__stat" key={stat.label}>
            <dt>{stat.value}</dt>
            <dd className="about__stat-label">{stat.label}</dd>
            <dd className="about__stat-sub">{stat.sub}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
