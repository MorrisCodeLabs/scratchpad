import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { QrCode, Download } from "lucide-react";
import { cn } from "@/lib/cn";

const FG_PRESETS = ["#000000", "#2954a5", "#c0362c", "#2f7a4f", "#7a4fae"];

export function QrBlockView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const text: string = node.attrs.text;
  const fgColor: string = node.attrs.fgColor ?? "#000000";
  const bgColor: string = node.attrs.bgColor ?? "#ffffff";
  const isPro = Boolean(editor.storage.proContext?.isPro);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(text, {
      width: 180,
      margin: 1,
      color: { dark: isPro ? fgColor : "#000000", light: isPro ? bgColor : "#ffffff" },
    })
      .then((url) => !cancelled && setDataUrl(url))
      .catch(() => !cancelled && setDataUrl(null));
    return () => {
      cancelled = true;
    };
  }, [text, isPro, fgColor, bgColor]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qr-code.png";
    a.click();
  };

  return (
    <NodeViewWrapper data-type="qr-block" className="my-2 flex flex-wrap items-start gap-4 rounded-lg border border-line bg-surface p-4">
      <div className="flex h-[180px] w-[180px] shrink-0 items-center justify-center rounded-md border border-line bg-surface-2">
        {dataUrl ? (
          <img src={dataUrl} alt="QR code" width={180} height={180} className="rounded-sm" />
        ) : (
          <QrCode size={28} className="text-faint" />
        )}
      </div>
      <div className="min-w-[180px] flex-1">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">QR code content</p>
        <input
          contentEditable={false}
          value={text}
          onChange={(e) => updateAttributes({ text: e.target.value })}
          placeholder="URL or text to encode…"
          className="mb-3 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none placeholder:text-faint"
        />

        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
          Color
          {!isPro && <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-accent-ink">Pro</span>}
        </p>
        <div className={cn("flex items-center gap-1.5", !isPro && "pointer-events-none opacity-40")}>
          {FG_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => updateAttributes({ fgColor: c })}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                fgColor === c ? "border-ink" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>

        {dataUrl && (
          <button
            type="button"
            onClick={download}
            className="mt-3 flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-ink"
          >
            <Download size={13} /> Download PNG
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}
