import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, sideOffset = 6, onMouseDown, ...props }: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        // Popovers opened from the selection toolbar float above a
        // contentEditable — a plain mousedown on a swatch/button inside them
        // would blur the editor before the click finishes, which collapses
        // the selection and unmounts the toolbar (and this popover with it)
        // mid-click. Suppress that default everywhere except real text
        // inputs, which still need a click to move focus/caret into them.
        onMouseDown={(e) => {
          const tag = (e.target as HTMLElement).tagName;
          if (tag !== "INPUT" && tag !== "TEXTAREA") e.preventDefault();
          onMouseDown?.(e);
        }}
        className={cn("z-50 rounded-xl border border-line bg-surface p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_rgba(0,0,0,0.1)]", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
