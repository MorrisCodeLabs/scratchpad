import { useWorkspaceContext } from "@/lib/workspace-context";
import { NoteEditor } from "@/components/editor/NoteEditor";

export function NoteView({ noteId }: { noteId: string }) {
  const { notes } = useWorkspaceContext();
  const note = notes.notes.find((n) => n.id === noteId);

  if (notes.loading) {
    return <div className="flex h-full items-center justify-center text-sm text-faint">Loading note…</div>;
  }

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-faint">
        This note doesn't exist, or you don't have access to it.
      </div>
    );
  }

  return <NoteEditor key={note.id} note={note} />;
}
