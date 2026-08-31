import { useEffect, useState } from "react";

// Matches Tailwind's `md` breakpoint (768px) — covers every iPhone in
// portrait (max width ~430px on the largest Pro Max) with headroom, while
// staying out of the way on iPad/desktop.
const QUERY = "(max-width: 767px)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
