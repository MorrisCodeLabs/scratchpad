import { useState, type FormEvent } from "react";
import { NotebookPen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { Workspace } from "@/lib/types";

// First-run gate: a brand-new workspace (workspaces.onboarded_at is null,
// per migration 0014) sees this instead of the app shell, so naming your
// workspace happens before you can do anything else. Existing workspaces
// were backfilled with onboarded_at set, so this only ever shows once.
export function WorkspaceOnboarding({ workspace, onComplete }: { workspace: Workspace; onComplete: () => Promise<void> }) {
  const [name, setName] = useState(workspace.name === "My Workspace" ? "" : workspace.name);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("workspaces")
        .update({ name: trimmed || "My Workspace", onboarded_at: new Date().toISOString() })
        .eq("id", workspace.id);
      if (error) throw error;
      await onComplete();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Couldn't set up your workspace.");
      setSaving(false);
    }
  };

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px] rounded-2xl border border-line bg-surface p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_rgba(0,0,0,0.06)]">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <NotebookPen size={20} />
        </div>
        <h1 className="mb-1.5 text-xl font-bold tracking-tight text-ink">Set up your workspace</h1>
        <p className="mb-6 text-[13px] leading-relaxed text-muted">
          Give it a name — you can change this any time in Settings.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Setting up…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
