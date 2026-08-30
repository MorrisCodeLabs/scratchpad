import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/cn";

export interface EmojiMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface EmojiMenuProps {
  items: { name: string; char: string }[];
  command: (item: { name: string; char: string }) => void;
}

export const EmojiMenu = forwardRef<EmojiMenuHandle, EmojiMenuProps>((props, ref) => {
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
      <div className="w-48 rounded-lg border border-line bg-surface p-2 text-sm text-faint shadow-lg">
        No matching emoji
      </div>
    );
  }

  return (
    <div className="grid max-h-56 w-56 grid-cols-6 gap-0.5 overflow-y-auto rounded-lg border border-line bg-surface p-1.5 shadow-lg">
      {props.items.map((item, index) => (
        <button
          key={item.name}
          type="button"
          title={`:${item.name}:`}
          onClick={() => select(index)}
          onMouseEnter={() => setSelected(index)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-lg",
            index === selected ? "bg-accent-soft" : "hover:bg-surface-2",
          )}
        >
          {item.char}
        </button>
      ))}
    </div>
  );
});
EmojiMenu.displayName = "EmojiMenu";
