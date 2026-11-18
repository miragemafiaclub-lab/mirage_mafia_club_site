import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import LangProvider from "./i18n/LangProvider";
import { savedLang } from "./i18n/lang";
import { applyHead, headTags, pageMeta } from "./meta";
import ComparePage from "./pages/ComparePage";
import FirstTimePage from "./pages/FirstTimePage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import PageLayout from "./pages/PageLayout";
import PlayerPage from "./pages/PlayerPage";
import RatingPage from "./pages/RatingPage";
import StubPage from "./pages/StubPage";
import { RouteContext } from "./RouteContext";
import { localize, resolveRoute, type Route } from "./routes";

function Page({ route }: { route: Route }) {
  switch (route.page) {
    case "home":
      return <HomePage />;
    case "player":
      return (
        <PageLayout>
          <PlayerPage player={route.player} />
        </PageLayout>
      );
    case "rating":
      return (
        <PageLayout>
          <RatingPage />
        </PageLayout>
      );
    case "compare":
      return (
        <PageLayout>
          <ComparePage />
        </PageLayout>
      );
    case "firstTime":
      return (
        <PageLayout>
          <FirstTimePage />
        </PageLayout>
      );
    case "notFound":
      return (
        <PageLayout>
          <NotFoundPage />
        </PageLayout>
      );
    default:
      return (
        <PageLayout>
          <StubPage page={route.page} />
        </PageLayout>
      );
  }
}

export default function App() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const route = useMemo(() => resolveRoute(pathname), [pathname]);

  // Title, description and link-preview tags follow the page when moving around without a reload.
  useEffect(() => {
    applyHead(headTags(pageMeta(route)));
  }, [route]);

  // Someone who switched to English earlier gets the English home page next time.
  useEffect(() => {
    if (route.page === "home" && route.lang === "ru" && savedLang() === "en") {
      navigate(localize("/", "en") + hash, { replace: true });
    }
    // Only on arrival: later switches go through the language switch itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After moving to another page: start at the top, or at the section in the #hash.
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <RouteContext.Provider value={route}>
      <LangProvider lang={route.lang}>
        <Page route={route} />
      </LangProvider>
    </RouteContext.Provider>
  );
}
