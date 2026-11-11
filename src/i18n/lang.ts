import { createContext, useContext } from "react";

export type Lang = "ru" | "en";

/** A pair of translations: every UI string or dictionary exists in both languages. */
export type Translations<T> = Record<Lang, T>;

export const LANGS: Lang[] = ["ru", "en"];
export const STORAGE_KEY = "mmc-lang";

export interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const LangContext = createContext<LangState>({ lang: "ru", setLang: () => {} });

/** Current language and its setter. */
export function useLang(): LangState {
  return useContext(LangContext);
}

/** Pick the current language's version of a dictionary: `const t = useT(dict)`. */
export function useT<T>(dict: Translations<T>): T {
  return dict[useContext(LangContext).lang];
}

/** Saved choice first; otherwise Russian for ru/uk/be browsers, English for everyone else. */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en") return saved;
  } catch {
    // Storage can be blocked (private mode) — fall through to the browser language.
  }
  const langs = typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language];
  return langs.some((l) => /^(ru|uk|be)\b/i.test(l)) ? "ru" : "en";
}
