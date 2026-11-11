import heroTable from "../assets/hero-table.jpeg";
import "./Hero.css";

const SIDE_WORDS = ["People", "Game", "Emotions", "Warsaw"];

export default function Hero() {
  return (
    <section className="hero" id="home">
      <img className="hero__bg" src={heroTable} alt="Players around the Mirage Mafia Club table" />
      <div className="hero__overlay" />

      <div className="hero__content">
        <p className="hero__eyebrow">Warsaw</p>
        <h1 className="hero__title">
          Mirage
          <br />
          Mafia Club
        </h1>
        <p className="hero__script">Do what makes you happy</p>
        <p className="hero__lead">
          Больше чем просто игра.
          <br />
          Большое комьюнити людей, кто думает, чувствует и играет в классном коллективе игроков.
        </p>

        <div className="hero__actions">
          <a className="hero__btn hero__btn--primary" href="#join">
            Play with us <span aria-hidden="true">→</span>
          </a>
          <a className="hero__btn hero__btn--ghost" href="#about">
            About the club
          </a>
        </div>
      </div>

      <ul className="hero__side-words" aria-hidden="true">
        {SIDE_WORDS.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ul>

      <a className="hero__scroll" href="#about">
        <span className="hero__scroll-line" aria-hidden="true" />
        Scroll
      </a>
    </section>
  );
}
