import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Purging an account (its auth.users row, workspaces, notes, and storage
// objects) needs the Admin API / a service-role key, which this client
// never holds. So "delete" here only flags the account for deletion —
// actual removal is a backend job that isn't part of this app yet.
export function DeleteAccountDialog({
  open,
  onOpenChange,
  email,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onConfirm: () => Promise<void>;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canConfirm = confirmText.trim().toLowerCase() === email.toLowerCase();

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      await onConfirm();
      await supabase.auth.signOut();
    } finally {
      setSubmitting(false);
      setConfirmText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setConfirmText("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle>Delete account</DialogTitle>
        <DialogDescription>
          This flags your account for deletion — someone reviews and processes it, it isn't instant. You'll be signed out
          right away. Type <span className="font-medium text-ink">{email}</span> to confirm.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            autoFocus
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={email}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
          <Button variant="danger" disabled={!canConfirm || submitting} onClick={handleConfirm} className="w-full">
            {submitting ? "Requesting…" : "Delete account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
