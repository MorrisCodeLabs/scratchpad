import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, sideOffset = 6, ...props }: PopoverPrimitive.PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn("z-50 rounded-xl border border-line bg-surface p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_rgba(0,0,0,0.1)]", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
