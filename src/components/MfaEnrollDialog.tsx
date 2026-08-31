import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccountSecurity } from "@/lib/use-account-security";

export function MfaEnrollDialog({
  open,
  onOpenChange,
  onEnrolled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnrolled: () => void;
}) {
  const { enrollMfa, verifyMfa } = useAccountSecurity();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFactorId(null);
      setSecret(null);
      setCode("");
      setError(null);
      return;
    }
    enrollMfa().then(({ data, error: enrollError }) => {
      if (enrollError || !data) {
        setError(enrollError?.message ?? "Could not start enrollment.");
        return;
      }
      setFactorId(data.id);
      setSecret(data.totp.secret);
    });
  }, [open]);

  const confirm = async () => {
    if (!factorId || !code.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: verifyError } = await verifyMfa(factorId, code.trim());
    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    onEnrolled();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Set up two-factor authentication</DialogTitle>
        <DialogDescription>
          Add this code to your authenticator app (Google Authenticator, 1Password, etc.), then enter the 6-digit code it
          shows.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          {secret && (
            <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-ink break-all">
              {secret}
            </div>
          )}
          <Input
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            onKeyDown={(e) => e.key === "Enter" && confirm()}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button onClick={confirm} disabled={!factorId || !code.trim() || submitting} className="w-full">
            {submitting ? "Verifying…" : "Verify and enable"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
