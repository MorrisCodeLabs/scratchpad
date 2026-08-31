import { useId } from "react";
import { cn } from "@/lib/cn";

// Magic UI's free "Dot Pattern" component (linear-gradient-fade variant) —
// a tiled SVG circle pattern, faded out via a CSS mask so it reads as an
// ambient backdrop instead of a hard-edged grid. Recreated from memory
// (no live internet access in this session to pull the current source),
// adapted to this repo's cn() utility. Pure SVG/CSS, no JS needed at
// runtime, so it renders fine with zero client hydration.
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  glow?: boolean;
}

export function DotPattern({
  width = 20,
  height = 20,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/[0.14]",
        "[mask-image:linear-gradient(to_bottom,white,transparent_85%)]",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={0} y={0}>
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
