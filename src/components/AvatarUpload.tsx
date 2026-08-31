import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function AvatarUpload({
  avatarUrl,
  onUpload,
}: {
  avatarUrl: string | null;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 text-xs font-medium text-muted",
        )}
      >
        {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : "—"}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <Button variant="outline" size="sm" onClick={pick} disabled={uploading}>
        {uploading ? "Uploading…" : "Upload"}
      </Button>
    </div>
  );
}
