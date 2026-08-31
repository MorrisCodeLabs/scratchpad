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
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFactorId(null);
      setSecret(null);
      setQrCode(null);
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
      setQrCode(data.totp.qr_code);
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
          Scan this QR code with your authenticator app (Google Authenticator, 1Password, etc.), then enter the 6-digit
          code it shows.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          {qrCode && (
            <div className="flex justify-center rounded-lg border border-line bg-white p-3">
              <img src={qrCode} alt="Scan with your authenticator app" className="h-40 w-40" />
            </div>
          )}
          {secret && (
            <details className="text-xs text-ink-muted">
              <summary className="cursor-pointer select-none">Can't scan? Enter code manually</summary>
              <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs text-ink break-all">
                {secret}
              </div>
            </details>
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
