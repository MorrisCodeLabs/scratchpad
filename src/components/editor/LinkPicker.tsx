import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Link2, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function LinkPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) setUrl(editor.getAttributes("link").href ?? "");
  }, [open, editor]);

  const apply = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Link"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink",
            editor.isActive("link") && "bg-accent-soft text-accent-ink",
          )}
        >
          <Link2 size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="https://example.com"
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={apply}>
            Set
          </Button>
        </div>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setOpen(false);
            }}
            className="mt-2 flex items-center gap-1.5 text-xs text-danger hover:underline"
          >
            <Trash2 size={12} /> Remove link
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
