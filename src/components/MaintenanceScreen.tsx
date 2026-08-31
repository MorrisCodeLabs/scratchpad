import { Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

// Shown to any signed-in user who isn't the app owner when
// PUBLIC_MAINTENANCE_MODE is set — see Workspace.tsx for the gate. Sign-in
// itself is never blocked (the owner has to be able to authenticate to
// prove they're the owner), so this only appears after a session exists.
export function MaintenanceScreen() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px] rounded-2xl border border-line bg-surface p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-warn-soft text-warn">
          <Wrench size={20} />
        </div>
        <h1 className="mb-1.5 text-xl font-bold tracking-tight text-ink">Down for maintenance</h1>
        <p className="mb-6 text-[13px] leading-relaxed text-muted">
          Scratchpad is offline for a bit while we make some changes. We'll be back shortly — thanks for your patience.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => supabase.auth.signOut().then(() => window.location.assign("/"))}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
