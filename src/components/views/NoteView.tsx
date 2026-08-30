import { useNote } from "@/lib/data/use-notes";
import { NoteEditor } from "@/components/editor/NoteEditor";

export function NoteView({ noteId }: { noteId: string }) {
  const { note, loading } = useNote(noteId);

  if (loading) {
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
