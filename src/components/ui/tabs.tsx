import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn("flex flex-row flex-nowrap gap-0.5 overflow-x-auto border-b border-line pb-2", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "shrink-0 rounded-lg px-3 py-2 text-left text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink data-[state=active]:bg-accent-soft data-[state=active]:text-accent-ink data-[state=active]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: TabsPrimitive.TabsContentProps) {
  return <TabsPrimitive.Content className={cn("flex-1 min-w-0", className)} {...props} />;
}
