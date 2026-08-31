import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  sideOffset = 6,
  onMouseDown,
  onOpenAutoFocus,
  ...props
}: PopoverPrimitive.PopoverContentProps) {
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
        // Radix moves real DOM focus into the popover's content the moment
        // it opens (its own focus-management effect, not a mousedown
        // default the above can catch) — that focus jump blurs the editor
        // on its own and would hide the selection toolbar underneath.
        // Callers that genuinely need it (LinkPicker's URL field) still
        // get it via the input's own `autoFocus`, which fires independently
        // of Radix's focus-scope logic.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          onOpenAutoFocus?.(e);
        }}
        className={cn("z-50 rounded-xl border border-line bg-surface p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_rgba(0,0,0,0.1)]", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
