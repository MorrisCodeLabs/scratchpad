import { useState } from "react";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useIsPro, useIsOwnerAccount } from "@/lib/use-plan";
import { setWorkspacePlan } from "@/lib/plan-actions";
import { cn } from "@/lib/cn";

const FREE_FEATURES = ["Unlimited notes and folders", "Slash-command block editor", "Calendar view and search", "Keyboard shortcuts, word-count goals"];
const PRO_FEATURES = ["Everything in Free", "Automatic version history with restore", "Export to Markdown and PDF"];

export function BillingSettings() {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const isPro = useIsPro();
  const isOwner = useIsOwnerAccount();
  const [loading, setLoading] = useState(false);

  const setPlan = async (plan: "free" | "pro") => {
    setLoading(true);
    const ok = await setWorkspacePlan(workspace.id, plan);
    if (ok) await refreshWorkspace();
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <p className="text-sm text-muted">Current plan:</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
            isPro ? "bg-accent-soft text-accent-ink" : "bg-surface-2 text-muted",
          )}
        >
          {isPro ? "Pro" : "Free"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PlanCard title="Free" features={FREE_FEATURES} active={!isPro} />
        <PlanCard title="Pro" features={PRO_FEATURES} active={isPro} icon={Sparkles} />
      </div>

      {isOwner ? (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent-ink">
          <Crown size={14} />
          You have permanent Pro access as the app owner — this doesn't depend on the plan toggle below.
        </div>
      ) : (
        <div className="mt-4">
          {isPro ? (
            <Button variant="outline" size="sm" disabled={loading} onClick={() => setPlan("free")}>
              {loading ? "Working…" : "Downgrade to Free"}
            </Button>
          ) : (
            <Button size="sm" disabled={loading} onClick={() => setPlan("pro")}>
              {loading ? "Working…" : "Upgrade to Pro"}
            </Button>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] text-faint">
        Demo build — no payment processor is wired up, so this switch flips the plan directly. In production this is
        where a Stripe checkout (or similar) would land before setting the same flag.
      </p>
    </div>
  );
}

function PlanCard({
  title,
  features,
  active,
  icon: Icon,
}: {
  title: string;
  features: string[];
  active: boolean;
  icon?: typeof Sparkles;
}) {
  return (
    <div className={cn("rounded-lg border p-4", active ? "border-accent bg-accent-soft/40" : "border-line bg-surface")}>
      <div className="mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-accent" />}
        <p className="text-sm font-semibold text-ink">{title}</p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-muted">
            <Check size={12} className="mt-0.5 shrink-0 text-good" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
