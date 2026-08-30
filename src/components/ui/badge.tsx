import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent-soft text-accent-ink",
        secondary: "bg-surface-2 text-muted",
        outline: "border border-line text-muted",
        good: "bg-good-soft text-good",
        warn: "bg-warn-soft text-warn",
        danger: "bg-danger-soft text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
