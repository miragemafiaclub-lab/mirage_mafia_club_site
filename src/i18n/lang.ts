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

/** The language the visitor picked with the switch, if they ever did. */
export function savedLang(): Lang | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "en") return saved;
  } catch {
    // Storage can be blocked (private mode): nothing saved then.
  }
  return null;
}

/** Remembers the visitor's explicit choice, so the home page opens in that language next time. */
export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore blocked storage; the choice just won't be remembered.
  }
}
