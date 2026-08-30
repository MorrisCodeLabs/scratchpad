// Applies a workspace's custom brand accent (Pro feature) as CSS custom
// property overrides on the root element. Uses color-mix() to derive the
// "soft"/"ink" variants from a single hex instead of hand-picking three
// colors — supported in every evergreen browser this app targets.
export function applyBrandAccent(hex: string | null | undefined) {
  const root = document.documentElement;
  if (!hex) {
    root.style.removeProperty("--sp-accent");
    root.style.removeProperty("--sp-accent-ink");
    root.style.removeProperty("--sp-accent-soft");
    return;
  }
  root.style.setProperty("--sp-accent", hex);
  root.style.setProperty("--sp-accent-ink", `color-mix(in srgb, ${hex} 75%, black)`);
  root.style.setProperty("--sp-accent-soft", `color-mix(in srgb, ${hex} 16%, white)`);
}

export const BRAND_PRESETS = [
  { name: "Ink blue", value: "#2954a5" },
  { name: "Forest", value: "#2f7a4f" },
  { name: "Plum", value: "#7a4fae" },
  { name: "Terracotta", value: "#b3562c" },
  { name: "Slate", value: "#475569" },
  { name: "Rose", value: "#be3455" },
];
