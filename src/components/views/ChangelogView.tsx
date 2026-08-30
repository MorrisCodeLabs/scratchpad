import { Sparkles, Wrench, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type EntryKind = "new" | "improved" | "fixed";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  kind: EntryKind;
  items: string[];
}

const KIND_META: Record<EntryKind, { label: string; badgeVariant: "default" | "secondary" | "good"; icon: typeof Sparkles }> = {
  new: { label: "New", badgeVariant: "default", icon: Sparkles },
  improved: { label: "Improved", badgeVariant: "secondary", icon: Wrench },
  fixed: { label: "Fixed", badgeVariant: "good", icon: ShieldCheck },
};

const ENTRIES: ChangelogEntry[] = [
  {
    version: "v0.6",
    date: "Aug 30, 2026",
    title: "Settings redesign & stability fixes",
    kind: "fixed",
    items: [
      "Rebuilt Settings on card-based layout with proper labeled sections",
      "Fixed a crash when locking a note from the note menu",
      "Restored the Blank option in the New Note template menu",
      "Added an app-wide safety net so a rendering error shows a recoverable message instead of a blank page",
    ],
  },
  {
    version: "v0.5",
    date: "Aug 30, 2026",
    title: "Workspace navigation overhaul",
    kind: "improved",
    items: [
      "Sidebar collapses to an icon-only rail, with state remembered between visits",
      "New account menu for Settings, Upgrade, Trash, and Sign out",
      "Note title is now edited directly in the header",
      "Formatting toolbar moved under the title, out of the way of note properties",
    ],
  },
  {
    version: "v0.4",
    date: "Aug 30, 2026",
    title: "Editor toolbar polish",
    kind: "improved",
    items: [
      "Redesigned the formatting toolbar with clearer grouping and consistent spacing",
      "Fixed highlighted text becoming unreadable in dark mode",
      "Expanded the highlight palette to 10 pastel colors",
    ],
  },
  {
    version: "v0.3",
    date: "Aug 30, 2026",
    title: "Pro features: research, security, and layout",
    kind: "new",
    items: [
      "Split-screen editing — view two notes side by side",
      "Citation manager with inline citations and an auto-generated bibliography",
      "Flashcard study mode generated from a note's headings",
      "Client-side encrypted notes with a passphrase",
      "Database blocks with typed, sortable, filterable columns",
      "Per-note comments and public read-only share links",
    ],
  },
  {
    version: "v0.2",
    date: "Aug 30, 2026",
    title: "Core editing foundations",
    kind: "new",
    items: [
      "Note locking, reminders, and custom brand color",
      "In-note and cross-workspace find & replace",
      "Folder colors, custom trash retention, and Markdown import",
      "Note linking with [[ mentions and a backlinks panel",
    ],
  },
];

export function ChangelogView() {
  return (
    <div className="mx-auto h-full max-w-2xl overflow-y-auto px-10 py-10">
      <h1 className="mb-1 text-[1.7rem] font-bold tracking-tight text-ink">Changelog</h1>
      <p className="mb-10 text-sm text-faint">New features, improvements, and fixes as they ship.</p>

      <div className="relative flex flex-col gap-10 border-l border-line pl-8">
        {ENTRIES.map((entry) => {
          const meta = KIND_META[entry.kind];
          const Icon = meta.icon;
          return (
            <div key={entry.version} className="relative">
              <span
                className={cn(
                  "absolute -left-[calc(2rem+5px)] top-1 flex h-[9px] w-[9px] items-center justify-center rounded-full ring-4 ring-bg",
                  entry.kind === "new" ? "bg-accent" : entry.kind === "fixed" ? "bg-good" : "bg-faint",
                )}
              />
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={meta.badgeVariant}>
                  <Icon size={11} /> {meta.label}
                </Badge>
                <span className="text-xs font-medium text-faint">{entry.version}</span>
                <span className="text-xs text-faint">·</span>
                <span className="text-xs text-faint">{entry.date}</span>
              </div>
              <h2 className="mb-2 text-[15px] font-semibold text-ink">{entry.title}</h2>
              <ul className="flex flex-col gap-1.5">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
