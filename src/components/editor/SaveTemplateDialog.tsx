import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SaveTemplateDialog({
  open,
  onOpenChange,
  defaultName,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  onSave: (name: string) => Promise<boolean>;
}) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const ok = await onSave(name.trim() || "Untitled template");
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Save as template</DialogTitle>
        <DialogDescription>This note's current content becomes a reusable template for the whole workspace.</DialogDescription>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="Template name"
          className="mt-3"
        />
        <Button onClick={save} disabled={saving} className="mt-3 w-full">
          {saving ? "Saving…" : "Save template"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
