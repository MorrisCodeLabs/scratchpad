import { useState } from "react";
import { Printer } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DEFAULT_PRINT_LAYOUT, type PrintLayoutOptions } from "@/lib/export/print-export";

export function PrintLayoutDialog({
  open,
  onOpenChange,
  onPrint,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (layout: PrintLayoutOptions) => void;
}) {
  const [layout, setLayout] = useState<PrintLayoutOptions>(DEFAULT_PRINT_LAYOUT);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <Printer size={16} /> Advanced print layout
        </DialogTitle>
        <DialogDescription>Choose how this note is laid out before opening the print/PDF dialog.</DialogDescription>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Page size</p>
            <Select value={layout.pageSize} onValueChange={(v) => setLayout({ ...layout, pageSize: v as PrintLayoutOptions["pageSize"] })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Columns</p>
            <Select value={String(layout.columns)} onValueChange={(v) => setLayout({ ...layout, columns: Number(v) as 1 | 2 })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single column</SelectItem>
                <SelectItem value="2">Two columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={layout.titlePage}
              onChange={(e) => setLayout({ ...layout, titlePage: e.target.checked })}
            />
            Include a title page
          </label>
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={layout.pageNumbers}
              onChange={(e) => setLayout({ ...layout, pageNumbers: e.target.checked })}
            />
            Show page numbers
          </label>

          <Button
            onClick={() => {
              onPrint(layout);
              onOpenChange(false);
            }}
            className="mt-1 w-full"
          >
            Open print dialog
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
