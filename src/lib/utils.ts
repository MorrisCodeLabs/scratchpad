// shadcn's CLI always imports `cn` from "@/lib/utils" by convention — this
// just re-exports the app's existing cn() (src/lib/cn.ts) instead of
// keeping two copies of the same clsx+twMerge implementation in sync.
export { cn } from "@/lib/cn";
