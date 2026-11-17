import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { switchLang } from "../routes";
import { LangContext, saveLang, type Lang } from "./lang";

/** The language comes from the address (/en/… is English); switching it opens the same page in the other language. */
export default function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    saveLang(next);
    if (next !== lang) navigate(switchLang(pathname, next) + hash, { preventScrollReset: true });
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
