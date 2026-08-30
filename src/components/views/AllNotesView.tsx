import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { docToText } from "@/lib/text-stats";
import { NewNoteMenu } from "@/components/NewNoteMenu";
import { NoteCard } from "@/components/views/NoteCard";

export function AllNotesView() {
  const { notes, navigate } = useWorkspaceContext();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes.notes;
    return notes.notes.filter(
      (n) => n.title.toLowerCase().includes(q) || docToText(n.content).toLowerCase().includes(q),
    );
  }, [notes.notes, query]);

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">All notes</h1>
        <NewNoteMenu>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={15} /> New note
          </button>
        </NewNoteMenu>
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} onOpen={() => navigate({ name: "note", id: note.id })} />
          ))}
        </div>
      )}
    </div>
  );
}
