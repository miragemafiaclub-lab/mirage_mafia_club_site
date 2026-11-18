// The home hero background, shared by Hero.tsx (<img>) and entry-server.tsx (<link rel="preload"> in the
// prerendered head). Sizes come from scripts/optimize-images.mjs; the source photo is 861 px wide, so that is
// the largest copy.
import hero640 from "../assets/web/hero-table-640.webp";
import hero861 from "../assets/web/hero-table-861.webp";

export const HERO_IMAGE = {
  src: hero861,
  srcSet: `${hero640} 640w, ${hero861} 861w`,
  // object-fit: cover on a full-screen box: as wide as the screen, or wider on portrait screens, where the
  // height decides (861/1280 ≈ 0.67 of the viewport height).
  sizes: "(max-aspect-ratio: 861/1280) 68vh, 100vw",
  width: 861,
  height: 1280,
};

/** <link rel="preload"> for the hero, so the browser starts it before the stylesheet and fonts. */
export const heroPreloadTag = () =>
  `<link rel="preload" as="image" type="image/webp" href="${HERO_IMAGE.src}" imagesrcset="${HERO_IMAGE.srcSet}" imagesizes="${HERO_IMAGE.sizes}" fetchpriority="high" />`;
