import { useCallback, useEffect, useState } from "react";

// A minimal client-side router. Scratchpad is a single React island, so full
// react-router weight isn't needed — a handful of routes over history.pushState
// covers it, and every Astro page mounts the same island regardless of path.
export type Route =
  | { name: "all-notes" }
  | { name: "note"; id: string }
  | { name: "trash" }
  | { name: "settings"; section?: string }
  | { name: "changelog" }
  | { name: "bug-reports" };

function parse(pathname: string): Route {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "note" && parts[1]) return { name: "note", id: parts[1] };
  if (parts[0] === "trash") return { name: "trash" };
  if (parts[0] === "settings") return { name: "settings", section: parts[1] };
  if (parts[0] === "changelog") return { name: "changelog" };
  if (parts[0] === "bug-reports") return { name: "bug-reports" };
  return { name: "all-notes" };
}

function toPath(route: Route): string {
  switch (route.name) {
    case "note":
      return `/note/${route.id}`;
    case "trash":
      return "/trash";
    case "settings":
      return route.section ? `/settings/${route.section}` : "/settings";
    case "changelog":
      return "/changelog";
    case "bug-reports":
      return "/bug-reports";
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
