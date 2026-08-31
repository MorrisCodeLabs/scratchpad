import { useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

// Aceternity UI's free "Resizable Navbar" component — full-width at the
// top of the page, shrinks into a smaller floating pill (blurred surface,
// border, shadow) once you scroll past the hero. Recreated from memory
// (no live internet access in this session to pull the current source),
// using the `motion` package (framer-motion's current successor, which is
// what Aceternity's newer snippets import from `motion/react`).
//
// Logo and CTA are hardcoded here rather than taken as ReactNode props —
// this component gets `client:load`-hydrated from an .astro page, and
// Astro can only pass JSON-serializable props across that boundary, not
// JSX. Fine since this navbar is specific to this one landing page anyway.
export interface NavItem {
  label: string;
  href: string;
}

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-base">📝</span>
      <span className="text-[15px] font-bold tracking-tight text-ink">Scratchpad</span>
    </a>
  );
}

function Cta() {
  return (
    <div className="flex items-center gap-2">
      <a
        href="/app"
        className="hidden h-9 items-center justify-center rounded-lg px-4 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2 lg:flex"
      >
        Sign in
      </a>
      <a
        href="/app"
        className="flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-[13px] font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Get started
      </a>
    </div>
  );
}

export function ResizableNavbar({ navItems }: { navItems: NavItem[] }) {
  const { scrollY } = useScroll();
  const [shrunk, setShrunk] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShrunk(latest > 80);
  });

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* Desktop */}
      <motion.div
        animate={{
          width: shrunk ? "min(640px, 92vw)" : "100%",
          marginTop: shrunk ? 14 : 0,
          paddingLeft: shrunk ? 20 : 24,
          paddingRight: shrunk ? 20 : 24,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn(
          "relative mx-auto hidden max-w-6xl flex-row items-center justify-between rounded-full py-2.5 lg:flex",
          shrunk && "border border-line bg-surface/85 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md",
        )}
      >
        <Logo />
        <div className="flex flex-1 items-center justify-center gap-6 text-[13px] font-medium text-muted">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </a>
          ))}
        </div>
        <Cta />
      </motion.div>

      {/* Mobile */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:hidden">
        <Logo />
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="mx-4 flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 shadow-xl lg:hidden"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 border-t border-line pt-3">
              <Cta />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
