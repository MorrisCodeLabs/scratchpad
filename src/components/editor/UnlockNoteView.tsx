import { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { decryptContent, isEncryptedPayload, type EncryptedPayload } from "@/lib/note-encryption";

export function UnlockNoteView({
  content,
  onUnlock,
}: {
  content: unknown;
  onUnlock: (passphrase: string, decrypted: Record<string, unknown>) => void;
}) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const submit = async () => {
    if (!isEncryptedPayload(content)) return;
    setWorking(true);
    setError(null);
    try {
      const decrypted = await decryptContent(content as EncryptedPayload, passphrase);
      onUnlock(passphrase, decrypted);
    } catch {
      setError("Incorrect passphrase.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
        <Lock size={22} />
      </span>
      <h1 className="text-xl font-bold text-ink">This note is encrypted</h1>
      <p className="max-w-sm text-sm text-muted">Enter the passphrase to unlock it for this session.</p>
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2">
        <Input
          type="password"
          autoFocus
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Passphrase"
        />
        {error && (
          <p className="flex items-center justify-center gap-1 text-xs text-danger">
            <ShieldAlert size={12} /> {error}
          </p>
        )}
        <Button size="sm" onClick={submit} disabled={working || !passphrase}>
          {working ? "Unlocking…" : "Unlock"}
        </Button>
      </div>
    </div>
  );
}
