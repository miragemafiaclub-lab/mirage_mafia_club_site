import { useEffect, useState, type ReactNode } from "react";
import { detectLang, LangContext, STORAGE_KEY, type Lang } from "./lang";

export default function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore blocked storage; the choice just won't be remembered.
    }
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
