import { createContext, useContext } from "react";
import { localize, resolveRoute, type Route } from "./routes";

export const RouteContext = createContext<Route>(resolveRoute("/"));

/** The page being shown: which one, in which language. */
export function useRoute(): Route {
  return useContext(RouteContext);
}

/** Link to a section of the home page: "#players" on the home page itself, "/en#players" from any other page. */
export function useSectionHref(): (id: string) => string {
  const route = useRoute();
  return (id) => (route.page === "home" ? `#${id}` : `${localize("/", route.lang)}#${id}`);
}
