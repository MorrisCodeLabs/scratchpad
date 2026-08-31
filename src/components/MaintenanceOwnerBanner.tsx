import { Wrench } from "lucide-react";

// Only ever rendered for the owner (see AppShell.tsx) — everyone else gets
// MaintenanceScreen.tsx instead of the app entirely. No dismiss button on
// purpose: forgetting maintenance mode is still on is the actual failure
// mode this exists to prevent.
export function MaintenanceOwnerBanner() {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2.5 bg-danger-soft px-4 py-1.5 text-center text-[12.5px] font-medium text-danger">
      <Wrench size={13} className="shrink-0" />
      <span>
        Maintenance mode is <strong>on</strong> — everyone but you is locked out right now.
      </span>
    </div>
  );
}
