import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useShortcutsDialog } from "@/lib/use-shortcuts-dialog";

const GROUPS: { title: string; shortcuts: { keys: string; label: string }[] }[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: "⌘K", label: "Open the command menu" },
      { keys: "?", label: "Show this shortcuts list" },
      { keys: "Esc", label: "Close a menu or dialog" },
    ],
  },
  {
    title: "Notes",
    shortcuts: [
      { keys: "⌘S", label: "Save the current note now" },
      { keys: "/", label: "Open the slash-command menu in the editor" },
      { keys: ":", label: "Open the emoji picker in the editor" },
    ],
  },
  {
    title: "Formatting",
    shortcuts: [
      { keys: "⌘B", label: "Bold" },
      { keys: "⌘I", label: "Italic" },
      { keys: "⌘U", label: "Underline" },
      { keys: "⌘Z / ⌘⇧Z", label: "Undo / redo" },
    ],
  },
];

export function ShortcutsDialog() {
  const { isOpen, setOpen } = useShortcutsDialog();

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Everything you can do without touching the mouse.</DialogDescription>

        <div className="mt-4 flex flex-col gap-4">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{group.title}</p>
              <div className="flex flex-col gap-1">
                {group.shortcuts.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-3 py-0.5">
                    <span className="text-sm text-ink">{s.label}</span>
                    <kbd className="shrink-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-xs text-muted">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
