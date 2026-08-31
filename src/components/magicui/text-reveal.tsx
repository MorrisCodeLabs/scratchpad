import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/cn";

// Magic UI's free "Text Reveal" component — the headline sits pinned
// (sticky) while its tall wrapper scrolls past underneath, and each word
// lights up from dim to full opacity as scroll progress passes that
// word's slice of the range. Recreated from memory (no live internet
// access in this session to pull the current source).
export function TextReveal({ text, className }: { text: string; className?: string }) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative h-[200vh]", className)}>
      <div className="sticky top-0 flex h-screen max-w-3xl items-center justify-center px-6">
        <span className="flex flex-wrap justify-center text-[2.25rem] font-bold leading-[1.15] tracking-tight sm:text-[3rem]">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1.5 sm:mx-2">
      <span className="absolute text-white/15">{children}</span>
      <motion.span style={{ opacity }} className="text-white">
        {children}
      </motion.span>
    </span>
  );
}
