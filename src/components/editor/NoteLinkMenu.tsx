import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/cn";

export interface NoteLinkMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface NoteLinkMenuProps {
  items: { id: string; title: string }[];
  command: (item: { id: string; title: string }) => void;
}

export const NoteLinkMenu = forwardRef<NoteLinkMenuHandle, NoteLinkMenuProps>((props, ref) => {
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
      <div className="w-56 rounded-lg border border-line bg-surface p-2 text-xs text-faint shadow-lg">
        No matching notes
      </div>
    );
  }

  return (
    <div className="max-h-56 w-64 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg">
      {props.items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => select(index)}
          onMouseEnter={() => setSelected(index)}
          className={cn(
            "flex w-full items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-xs text-ink",
            index === selected ? "bg-accent-soft text-accent-ink" : "hover:bg-surface-2",
          )}
        >
          <FileText size={13} className="shrink-0" />
          <span className="truncate">{item.title || "Untitled"}</span>
        </button>
      ))}
    </div>
  );
});
NoteLinkMenu.displayName = "NoteLinkMenu";
