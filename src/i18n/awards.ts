import type { Lang } from "./lang";

/**
 * iMafia award names come from the site in Ukrainian (see scripts/lib/imafia.mjs). Every name met in
 * src/data/profiles.json so far, in Russian and English. A new award iMafia adds shows in Ukrainian until it is added here.
 */
const AWARD_NAMES: Record<string, Record<Lang, string>> = {
  "Чемпіон iMafia": { ru: "Чемпион iMafia", en: "iMafia Champion" },
  "Легенда iMafia": { ru: "Легенда iMafia", en: "iMafia Legend" },
  "Кращий організатор": { ru: "Лучший организатор", en: "Best organiser" },
  "Кращий першовбитий": { ru: "Лучший первый убитый", en: "Best first-night victim" },
  "Кращий мирний": { ru: "Лучший мирный", en: "Best civilian" },
  "Кращий дон": { ru: "Лучший дон", en: "Best Don" },
  "Кращий офлайн турнір": { ru: "Лучший офлайн-турнир", en: "Best offline tournament" },
  "Прорив року": { ru: "Прорыв года", en: "Breakthrough of the year" },
};

/** The award's name in the page's language, or iMafia's original (Ukrainian) name with `lang: "uk"` when unknown. */
export function awardName(name: string, lang: Lang): { text: string; lang?: "uk" } {
  const known = AWARD_NAMES[name.trim()];
  return known ? { text: known[lang] } : { text: name, lang: "uk" };
}
