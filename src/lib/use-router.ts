import { useCallback, useEffect, useState } from "react";

// A minimal client-side router. Scratchpad is a single React island, so full
// react-router weight isn't needed — a handful of routes over history.pushState
// covers it, and every Astro page mounts the same island regardless of path.
export type Route =
  | { name: "all-notes" }
  | { name: "note"; id: string }
  | { name: "calendar" }
  | { name: "trash" }
  | { name: "settings"; section?: string };

function parse(pathname: string): Route {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "note" && parts[1]) return { name: "note", id: parts[1] };
  if (parts[0] === "calendar") return { name: "calendar" };
  if (parts[0] === "trash") return { name: "trash" };
  if (parts[0] === "settings") return { name: "settings", section: parts[1] };
  return { name: "all-notes" };
}

function toPath(route: Route): string {
  switch (route.name) {
    case "note":
      return `/note/${route.id}`;
    case "calendar":
      return "/calendar";
    case "trash":
      return "/trash";
    case "settings":
      return route.section ? `/settings/${route.section}` : "/settings";
    default:
      return "/";
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window !== "undefined" ? parse(window.location.pathname) : { name: "all-notes" },
  );

  useEffect(() => {
    const onPopState = () => setRoute(parse(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((next: Route) => {
    const path = toPath(next);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setRoute(next);
  }, []);

  return { route, navigate };
}
