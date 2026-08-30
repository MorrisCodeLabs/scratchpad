import * as React from "react";
import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useSession } from "@/lib/data/use-session";
import { useTheme, type ThemePreference } from "@/lib/use-theme";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import { BillingSettings } from "@/components/views/BillingSettings";
import { useShortcutsDialog } from "@/lib/use-shortcuts-dialog";
import { useIsPro } from "@/lib/use-plan";
import { ProBadge } from "@/components/pro/ProBadge";
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { BRAND_PRESETS } from "@/lib/brand-color";

export function SettingsView() {
  const { route, navigate } = useWorkspaceContext();
  const section = route.name === "settings" ? (route.section ?? "account") : "account";

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-10 py-10">
      <h1 className="mb-8 text-[1.7rem] font-bold tracking-tight text-ink">Settings</h1>
      <Tabs
        value={section}
        onValueChange={(v) => navigate({ name: "settings", section: v })}
        className="flex gap-10"
      >
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings />
        </TabsContent>
        <TabsContent value="editor">
          <EditorSettings />
        </TabsContent>
        <TabsContent value="workspace">
          <WorkspaceSettings />
        </TabsContent>
        <TabsContent value="billing">
          <BillingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-[13px] font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-faint">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function AccountSettings() {
  const { session } = useSession();
  return (
    <div className="divide-y divide-line">
      <SettingsRow label="Email" description="Used to sign in to Scratchpad.">
        <Input value={session?.user.email ?? ""} readOnly className="w-56 bg-surface-2 text-muted" />
      </SettingsRow>
      <SettingsRow label="Sign out" description="End your session on this device.">
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </SettingsRow>
    </div>
  );
}

function AppearanceSettings() {
  const { preference, setPreference } = useTheme();
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const isPro = useIsPro();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const currentAccent = workspace.theme?.accent ?? null;

  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const setAccent = async (hex: string | null) => {
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    const nextTheme = { ...workspace.theme };
    if (hex) nextTheme.accent = hex;
    else delete nextTheme.accent;
    await supabase.from("workspaces").update({ theme: nextTheme }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  return (
    <div className="divide-y divide-line">
      <SettingsRow label="Theme" description="Controls light/dark appearance across Scratchpad.">
        <div className="flex gap-1 rounded-lg border border-line p-0.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPreference(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                preference === opt.value ? "bg-accent text-white" : "text-muted hover:bg-surface-2",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </SettingsRow>
      <SettingsRow
        label={
          <span className="flex items-center gap-1.5">
            Brand color
            {!isPro && <ProBadge />}
          </span>
        }
        description="Replaces Scratchpad's accent color across the whole workspace — buttons, active states, highlights."
      >
        <div className="flex items-center gap-1.5">
          {BRAND_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={preset.name}
              onClick={() => setAccent(preset.value)}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                currentAccent === preset.value ? "border-ink" : "border-transparent",
              )}
              style={{ background: preset.value }}
            />
          ))}
          {currentAccent && (
            <button type="button" onClick={() => setAccent(null)} className="ml-1 text-xs text-faint transition-colors hover:text-ink">
              Reset
            </button>
          )}
        </div>
      </SettingsRow>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Custom brand color" />
    </div>
  );
}

function EditorSettings() {
  const [autosave, setAutosave] = useState(true);
  const [defaultFont, setDefaultFont] = useState("System UI");
  const { open: openShortcuts } = useShortcutsDialog();

  return (
    <div className="divide-y divide-line">
      <SettingsRow label="Autosave" description="Save notes automatically a moment after you stop typing.">
        <Switch checked={autosave} onCheckedChange={setAutosave} />
      </SettingsRow>
      <SettingsRow label="Default font" description="Applied to new notes' body text.">
        <select
          value={defaultFont}
          onChange={(e) => setDefaultFont(e.target.value)}
          className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink"
        >
          <option>System UI</option>
          <option>Serif</option>
          <option>Monospace</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Keyboard shortcuts" description="See every shortcut Scratchpad supports.">
        <Button variant="outline" size="sm" onClick={openShortcuts}>
          <Keyboard size={14} /> View shortcuts
        </Button>
      </SettingsRow>
    </div>
  );
}

const RETENTION_OPTIONS = [7, 14, 30, 60, 90];

function WorkspaceSettings() {
  const { workspace, userId, refreshWorkspace } = useWorkspaceContext();
  const isPro = useIsPro();
  const [name, setName] = useState(workspace.name);
  const [icon, setIcon] = useState(workspace.icon ?? "");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const save = async () => {
    await supabase.from("workspaces").update({ name: name.trim() || "Workspace", icon: icon || null }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  const setRetention = async (days: number) => {
    await supabase.from("workspaces").update({ trash_retention_days: days }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  return (
    <div className="divide-y divide-line">
      <SettingsRow label="Workspace name">
        <Input value={name} onChange={(e) => setName(e.target.value)} className="w-56" />
      </SettingsRow>
      <SettingsRow label="Icon" description="An emoji shown next to the workspace name.">
        <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-20 text-center" maxLength={4} />
      </SettingsRow>
      <SettingsRow
        label={
          <span className="flex items-center gap-1.5">
            Trash auto-empty
            {!isPro && <ProBadge />}
          </span>
        }
        description={
          isPro
            ? "Notes are permanently deleted this many days after being trashed."
            : `Trashed notes are permanently deleted after ${workspace.trash_retention_days} days.`
        }
      >
        {isPro ? (
          <select
            value={workspace.trash_retention_days}
            onChange={(e) => setRetention(Number(e.target.value))}
            className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink"
          >
            {RETENTION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setUpgradeOpen(true)}>
            Customize
          </Button>
        )}
      </SettingsRow>
      <div className="flex justify-end py-3">
        <Button size="sm" onClick={save}>
          Save changes
        </Button>
      </div>
      <p className="pt-3 text-xs text-faint">Owner: {userId}</p>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Custom trash retention" />
    </div>
  );
}
