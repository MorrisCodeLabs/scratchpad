import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Renders nothing — just sends an already-signed-in visitor straight into
// the app instead of making them look at the marketing page and find the
// sign-in button themselves.
export function LandingRedirect() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("/app");
    });
  }, []);

  return null;
}
