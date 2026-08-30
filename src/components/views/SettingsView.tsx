import * as React from "react";
import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useSession } from "@/lib/data/use-session";
import { useTheme, type ThemePreference } from "@/lib/use-theme";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import { BillingSettings } from "@/components/views/BillingSettings";
import { useShortcutsDialog } from "@/lib/use-shortcuts-dialog";
import { useIsPro } from "@/lib/use-plan";
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
        <TabsContent value="workspace" className="flex flex-col gap-5">
          <WorkspaceSettings />
          <UsageCard />
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Compare plans and manage your workspace's subscription.</CardDescription>
            </CardHeader>
            <CardContent>
              <BillingSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
  htmlFor,
}: {
  label: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <Label htmlFor={htmlFor}>{label}</Label>
        {description && <p className="mt-0.5 text-xs leading-relaxed text-faint">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function AccountSettings() {
  const { session } = useSession();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your sign-in identity for this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <SettingsRow htmlFor="account-email" label="Email" description="Used to sign in to Scratchpad.">
          <Input id="account-email" value={session?.user.email ?? ""} readOnly className="w-56 bg-surface-2 text-muted" />
        </SettingsRow>
        <SettingsRow label="Sign out" description="End your session on this device.">
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
        </SettingsRow>
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  const { preference, setPreference } = useTheme();
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const isPro = useIsPro();
  const currentAccent = workspace.theme?.accent ?? null;

  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const setAccent = async (hex: string | null) => {
    if (!isPro) return;
    const nextTheme = { ...workspace.theme };
    if (hex) nextTheme.accent = hex;
    else delete nextTheme.accent;
    await supabase.from("workspaces").update({ theme: nextTheme }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Theme and branding for how Scratchpad looks.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <SettingsRow label="Theme" description="Controls light/dark appearance across Scratchpad.">
          <div className="flex gap-1 rounded-lg border border-line p-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
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
        {isPro && (
          <SettingsRow
            label="Brand color"
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
        )}
      </CardContent>
    </Card>
  );
}

function EditorSettings() {
  const [autosave, setAutosave] = useState(true);
  const [defaultFont, setDefaultFont] = useState("System UI");
  const { open: openShortcuts } = useShortcutsDialog();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor</CardTitle>
        <CardDescription>Defaults for how the note editor behaves.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <SettingsRow htmlFor="autosave" label="Autosave" description="Save notes automatically a moment after you stop typing.">
          <Switch id="autosave" checked={autosave} onCheckedChange={setAutosave} />
        </SettingsRow>
        <SettingsRow label="Default font" description="Applied to new notes' body text.">
          <Select value={defaultFont} onValueChange={setDefaultFont}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="System UI">System UI</SelectItem>
              <SelectItem value="Serif">Serif</SelectItem>
              <SelectItem value="Monospace">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow label="Keyboard shortcuts" description="See every shortcut Scratchpad supports.">
          <Button variant="outline" size="sm" onClick={openShortcuts}>
            <Keyboard size={14} /> View shortcuts
          </Button>
        </SettingsRow>
      </CardContent>
    </Card>
  );
}

const RETENTION_OPTIONS = [7, 14, 30, 60, 90];

function WorkspaceSettings() {
  const { workspace, userId, refreshWorkspace } = useWorkspaceContext();
  const isPro = useIsPro();
  const [name, setName] = useState(workspace.name);
  const [icon, setIcon] = useState(workspace.icon ?? "");

  const save = async () => {
    await supabase.from("workspaces").update({ name: name.trim() || "Workspace", icon: icon || null }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  const setRetention = async (days: string) => {
    await supabase.from("workspaces").update({ trash_retention_days: Number(days) }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <CardDescription>Naming, icon, and trash retention for this workspace.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <SettingsRow htmlFor="workspace-name" label="Workspace name">
          <Input id="workspace-name" value={name} onChange={(e) => setName(e.target.value)} className="w-56" />
        </SettingsRow>
        <SettingsRow htmlFor="workspace-icon" label="Icon" description="An emoji shown next to the workspace name.">
          <Input id="workspace-icon" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-20 text-center" maxLength={4} />
        </SettingsRow>
        {isPro ? (
          <SettingsRow label="Trash auto-empty" description="Notes are permanently deleted this many days after being trashed.">
            <Select value={String(workspace.trash_retention_days)} onValueChange={setRetention}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingsRow>
        ) : (
          <SettingsRow
            label="Trash auto-empty"
            description={`Trashed notes are permanently deleted after ${workspace.trash_retention_days} days.`}
          >
            <span />
          </SettingsRow>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-xs text-faint">Owner: {userId}</p>
        <Button size="sm" onClick={save}>
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}

const NUDGE_THRESHOLD = 20;

function UsageCard() {
  const { notes, folders, navigate } = useWorkspaceContext();
  const isPro = useIsPro();

  const noteCount = notes.notes.length;
  const folderCount = folders.folders.length;
  const wordCount = notes.notes.reduce((sum, n) => sum + (n.word_count ?? 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
        <CardDescription>How much you've written in this workspace so far.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 text-center">
            <p className="text-lg font-semibold tabular-nums text-ink">{noteCount}</p>
            <p className="text-[11px] text-faint">Notes</p>
          </div>
          <div className="rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 text-center">
            <p className="text-lg font-semibold tabular-nums text-ink">{folderCount}</p>
            <p className="text-[11px] text-faint">Folders</p>
          </div>
          <div className="rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 text-center">
            <p className="text-lg font-semibold tabular-nums text-ink">{wordCount.toLocaleString()}</p>
            <p className="text-[11px] text-faint">Words</p>
          </div>
        </div>

        {!isPro && noteCount >= NUDGE_THRESHOLD && (
          <button
            type="button"
            onClick={() => navigate({ name: "settings", section: "billing" })}
            className="mt-4 w-full rounded-lg border border-accent bg-accent-soft px-3.5 py-2.5 text-left text-xs text-accent-ink transition-opacity hover:opacity-90"
          >
            <span className="font-medium">You've written {noteCount} notes.</span> Pro adds version history, bulk
            trash/import, and custom templates for workspaces this active — take a look.
          </button>
        )}
      </CardContent>
    </Card>
  );
}
