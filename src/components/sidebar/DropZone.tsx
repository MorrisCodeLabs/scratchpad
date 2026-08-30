import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";

export function DropZone({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "bg-accent-soft/60")}>
      {children}
    </div>
  );
}
