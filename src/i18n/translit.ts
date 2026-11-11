import type { Lang } from "./lang";

/** Spellings the players chose themselves; they win over the automatic transliteration. */
const NAME_OVERRIDES: Record<string, string> = {
  "Эльвира Вейзгейм": "Elvira Vezgeim",
};

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", ґ: "g", д: "d", е: "e", ё: "yo", є: "ye", ж: "zh", з: "z",
  и: "i", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "",
  ы: "y", ь: "", э: "e", ю: "yu", я: "ya", "’": "", "'": "",
};

function transliterate(text: string): string {
  return [...text]
    .map((ch) => {
      const lower = ch.toLowerCase();
      const out = MAP[lower];
      if (out === undefined) return ch;
      return ch === lower || !out ? out : out[0].toUpperCase() + out.slice(1);
    })
    .join("");
}

/** A player's real name for display: as written in Russian, Latin letters in English. Nicks are never passed here. */
export function displayName(name: string, lang: Lang): string {
  if (lang === "ru" || !name) return name;
  return NAME_OVERRIDES[name] ?? transliterate(name);
}

/** "ru" for Cyrillic text, so the browser hyphenates it correctly even on the English page. */
export function textLang(text: string): "ru" | undefined {
  return /[а-яёіїєґ]/i.test(text) ? "ru" : undefined;
}
