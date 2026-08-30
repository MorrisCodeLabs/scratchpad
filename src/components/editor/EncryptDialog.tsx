import { useState } from "react";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EncryptDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (passphrase: string) => Promise<void>;
}) {
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const submit = async () => {
    if (passphrase.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (passphrase !== confirm) {
      setError("Passphrases don't match.");
      return;
    }
    setError(null);
    setWorking(true);
    await onConfirm(passphrase);
    setWorking(false);
    setPassphrase("");
    setConfirm("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <Lock size={16} /> Encrypt this note
        </DialogTitle>
        <DialogDescription>
          Content is encrypted in your browser before it's saved — Scratchpad's servers only ever store ciphertext.
          There is no way to recover this note if you forget the passphrase.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Passphrase</label>
            <Input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Confirm passphrase</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={working}>
              {working ? "Encrypting…" : "Encrypt note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
