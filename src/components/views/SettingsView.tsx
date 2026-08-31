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
import { useUserPreferences } from "@/lib/data/use-user-preferences";
import { useTheme, type ThemePreference } from "@/lib/use-theme";
import { useEditorPrefs } from "@/lib/use-editor-prefs";
import { useAccountSecurity } from "@/lib/use-account-security";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import { useShortcutsDialog } from "@/lib/use-shortcuts-dialog";
import { FREE_PLAN_NOTE_LIMIT } from "@/lib/data/use-notes";
import { BillingSettings } from "@/components/views/BillingSettings";
import { AvatarUpload } from "@/components/AvatarUpload";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { MfaEnrollDialog } from "@/components/MfaEnrollDialog";

export function SettingsView() {
  const { route, navigate } = useWorkspaceContext();
  const section = route.name === "settings" ? (route.section ?? "account") : "account";

  return (
    <div className={cn("mx-auto h-full overflow-y-auto px-10 py-10", section === "billing" ? "max-w-5xl" : "max-w-3xl")}>
      <h1 className="mb-8 text-[1.7rem] font-bold tracking-tight text-ink">Settings</h1>
      <Tabs
        value={section}
        onValueChange={(v) => navigate({ name: "settings", section: v })}
        className="flex flex-col gap-6"
      >
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="workspace" className="flex flex-col gap-5">
          <WorkspaceSettings />
          <UsageCard />
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Compare plans for this workspace.</CardDescription>
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
  const email = session?.user.email ?? "";
  const { preferences, updatePreferences, uploadAvatar } = useUserPreferences();
  const { updatePassword, updateEmail } = useAccountSecurity();

  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  React.useEffect(() => {
    setDisplayName(preferences?.display_name ?? "");
  }, [preferences?.display_name]);

  const saveProfile = async () => {
    await updatePreferences({ display_name: displayName.trim() || null });
  };

  const savePassword = async () => {
    if (!newPassword) return;
    const { error } = await updatePassword(newPassword);
    setPasswordStatus(error ? error.message : "Password updated.");
    if (!error) setNewPassword("");
  };

  const saveEmail = async () => {
    if (!newEmail.trim()) return;
    const { error } = await updateEmail(newEmail.trim());
    setEmailStatus(error ? error.message : "Check your inbox to confirm the new email.");
    if (!error) setNewEmail("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your sign-in identity and profile.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          <SettingsRow label="Avatar" description="Shown next to your name across Scratchpad.">
            <AvatarUpload avatarUrl={preferences?.avatar_url ?? null} onUpload={uploadAvatar} />
          </SettingsRow>
          <SettingsRow htmlFor="account-display-name" label="Display name">
            <Input
              id="account-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-56"
            />
          </SettingsRow>
          <SettingsRow htmlFor="account-email" label="Email" description="Used to sign in to Scratchpad.">
            <Input id="account-email" value={email} readOnly className="w-56 bg-surface-2 text-muted" />
          </SettingsRow>
          <SettingsRow label="Sign out" description="End your session on this device.">
            <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </SettingsRow>
        </CardContent>
        <CardFooter className="justify-end">
          <Button size="sm" onClick={saveProfile}>
            Save changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update the password used to sign in.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          <SettingsRow htmlFor="new-password" label="New password">
            <div className="flex flex-col items-end gap-1">
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-56"
                placeholder="At least 8 characters"
              />
              {passwordStatus && <p className="text-xs text-faint">{passwordStatus}</p>}
            </div>
          </SettingsRow>
        </CardContent>
        <CardFooter className="justify-end">
          <Button size="sm" onClick={savePassword} disabled={!newPassword}>
            Update password
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Change email</CardTitle>
          <CardDescription>Supabase sends a confirmation link to the new address before it takes effect.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          <SettingsRow htmlFor="new-email" label="New email">
            <div className="flex flex-col items-end gap-1">
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-56"
                placeholder="you@example.com"
              />
              {emailStatus && <p className="text-xs text-faint">{emailStatus}</p>}
            </div>
          </SettingsRow>
        </CardContent>
        <CardFooter className="justify-end">
          <Button size="sm" onClick={saveEmail} disabled={!newEmail.trim()}>
            Update email
          </Button>
        </CardFooter>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>Permanently remove your account and everything in it.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          <SettingsRow
            label="Delete account"
            description={
              preferences?.deletion_requested_at
                ? `Deletion requested on ${new Date(preferences.deletion_requested_at).toLocaleDateString()}.`
                : "This flags your account for deletion; it isn't instant."
            }
          >
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)} disabled={!!preferences?.deletion_requested_at}>
              Delete account
            </Button>
          </SettingsRow>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        email={email}
        onConfirm={async () => {
          await updatePreferences({ deletion_requested_at: new Date().toISOString() });
        }}
      />
    </>
  );
}

function AppearanceSettings() {
  const { preference, setPreference } = useTheme();

  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Theme for how Scratchpad looks.</CardDescription>
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
      </CardContent>
    </Card>
  );
}

function EditorSettings() {
  const { autosave, defaultFont, setAutosave, setDefaultFont } = useEditorPrefs();
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

function NotificationSettings() {
  const { preferences, updatePreferences } = useUserPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what Scratchpad emails you about.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-line">
        <SettingsRow htmlFor="notify-digest" label="Email digest" description="A periodic summary of workspace activity.">
          <Switch
            id="notify-digest"
            checked={preferences?.notify_email_digest ?? true}
            onCheckedChange={(checked) => updatePreferences({ notify_email_digest: checked })}
          />
        </SettingsRow>
        <SettingsRow htmlFor="notify-comments" label="Comments" description="When someone comments on a note you can see.">
          <Switch
            id="notify-comments"
            checked={preferences?.notify_comments ?? true}
            onCheckedChange={(checked) => updatePreferences({ notify_comments: checked })}
          />
        </SettingsRow>
        <SettingsRow htmlFor="notify-mentions" label="Mentions" description="When someone mentions you in a note or comment.">
          <Switch
            id="notify-mentions"
            checked={preferences?.notify_mentions ?? true}
            onCheckedChange={(checked) => updatePreferences({ notify_mentions: checked })}
          />
        </SettingsRow>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const { listMfaFactors, unenrollMfa, signOutOtherDevices } = useAccountSecurity();
  const [factors, setFactors] = useState<{ id: string; status: string }[]>([]);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [signOutStatus, setSignOutStatus] = useState<string | null>(null);

  const refreshFactors = React.useCallback(async () => {
    const { factors: list } = await listMfaFactors();
    setFactors(list.map((f) => ({ id: f.id, status: f.status })));
  }, [listMfaFactors]);

  React.useEffect(() => {
    refreshFactors();
  }, [refreshFactors]);

  const verifiedFactor = factors.find((f) => f.status === "verified");

  const handleSignOutOthers = async () => {
    const { error } = await signOutOtherDevices();
    setSignOutStatus(error ? error.message : "Signed out of all other devices.");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Protect your account and manage active sessions.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-line">
          <SettingsRow
            label="Two-factor authentication"
            description={verifiedFactor ? "Enabled for this account." : "Add an extra step when signing in."}
          >
            {verifiedFactor ? (
              <Button variant="outline" size="sm" onClick={() => unenrollMfa(verifiedFactor.id).then(refreshFactors)}>
                Turn off
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setMfaDialogOpen(true)}>
                Set up
              </Button>
            )}
          </SettingsRow>
          <SettingsRow label="Sign out of other devices" description="Revoke access everywhere except this session.">
            <div className="flex flex-col items-end gap-1">
              <Button variant="outline" size="sm" onClick={handleSignOutOthers}>
                Sign out others
              </Button>
              {signOutStatus && <p className="text-xs text-faint">{signOutStatus}</p>}
            </div>
          </SettingsRow>
          <SettingsRow label="Data export" description="Download all your notes and attachments. Coming soon.">
            <Button variant="outline" size="sm" disabled>
              Export data
            </Button>
          </SettingsRow>
        </CardContent>
      </Card>

      <MfaEnrollDialog open={mfaDialogOpen} onOpenChange={setMfaDialogOpen} onEnrolled={refreshFactors} />
    </>
  );
}

const RETENTION_OPTIONS = [7, 14, 30, 60, 90];

function WorkspaceSettings() {
  const { workspace, userId, refreshWorkspace } = useWorkspaceContext();
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

function UsageCard() {
  const { notes, folders } = useWorkspaceContext();

  const noteCount = notes.notes.length;
  const folderCount = folders.folders.length;
  const wordCount = notes.notes.reduce((sum, n) => sum + (n.word_count ?? 0), 0);
  const atLimit = noteCount >= FREE_PLAN_NOTE_LIMIT;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
        <CardDescription>How much you've written in this workspace so far.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 text-center">
            <p className="text-lg font-semibold tabular-nums text-ink">
              {noteCount}
              <span className="text-xs font-normal text-faint"> / {FREE_PLAN_NOTE_LIMIT}</span>
            </p>
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
        {atLimit && (
          <p className="mt-3 rounded-md bg-warn-soft px-3 py-2 text-[11px] text-warn">
            You've reached the Free plan's {FREE_PLAN_NOTE_LIMIT}-note limit. Delete or trash a note to create a new one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
