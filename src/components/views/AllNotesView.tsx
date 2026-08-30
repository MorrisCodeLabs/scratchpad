import { useMemo, useState } from "react";
import { FileText, Plus, Pin, Star, Search } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { docToText } from "@/lib/text-stats";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export function AllNotesView() {
  const { workspace, notes, navigate } = useWorkspaceContext();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes.notes;
    return notes.notes.filter(
      (n) => n.title.toLowerCase().includes(q) || docToText(n.content).toLowerCase().includes(q),
    );
  }, [notes.notes, query]);

  const createNote = async () => {
    const note = await notes.createNote(workspace.id, null);
    if (note) navigate({ name: "note", id: note.id });
  };

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">All notes</h1>
        <button
          type="button"
          onClick={createNote}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={15} /> New note
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2">
        <Search size={15} className="text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this workspace…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-faint">
          {query ? "No notes match your search." : "No notes yet — create your first one."}
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {filtered.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => navigate({ name: "note", id: note.id })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
              >
                <FileText size={16} className="shrink-0 text-faint" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{note.title || "Untitled"}</p>
                  <p className="truncate text-xs text-faint">
                    {STATUS_LABEL[note.status]} · {note.word_count} words · Updated{" "}
                    {new Date(note.updated_at).toLocaleDateString()}
                  </p>
                </div>
                {note.is_pinned && <Pin size={13} className="shrink-0 text-faint" />}
                {note.is_favorite && <Star size={13} className="shrink-0 text-warn" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
