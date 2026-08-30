import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Editor, Range } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SlashMenuItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}

export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>((props, ref) => {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [props.items]);

  const select = (index: number) => {
    const item = props.items[index];
    if (item) props.command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === "ArrowUp") {
        setSelected((prev) => (prev + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((prev) => (prev + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        select(selected);
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) {
    return (
      <div className="w-64 rounded-lg border border-line bg-surface p-2 text-sm text-faint shadow-lg">
        No matching blocks
      </div>
    );
  }

  return (
    <div className="max-h-80 w-72 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg">
      {props.items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => select(index)}
            onMouseEnter={() => setSelected(index)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left",
              index === selected ? "bg-accent-soft" : "hover:bg-surface-2",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted">
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
              <span className="block truncate text-xs text-faint">{item.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
});
SlashMenu.displayName = "SlashMenu";
