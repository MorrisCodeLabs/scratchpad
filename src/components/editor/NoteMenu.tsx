import { MoreHorizontal, Pin, Star, Copy, Archive, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Note } from "@/lib/types";

export function NoteMenu({ note }: { note: Note }) {
  const { notes, navigate } = useWorkspaceContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Note actions">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => notes.updateNote(note.id, { is_pinned: !note.is_pinned })}>
          <Pin size={14} /> {note.is_pinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => notes.updateNote(note.id, { is_favorite: !note.is_favorite })}>
          <Star size={14} /> {note.is_favorite ? "Remove from favorites" : "Add to favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            const copy = await notes.duplicateNote(note);
            if (copy) navigate({ name: "note", id: copy.id });
          }}
        >
          <Copy size={14} /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => notes.archiveNote(note.id)}>
          <Archive size={14} /> Archive
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-danger"
          onSelect={() => {
            notes.trashNote(note.id);
            navigate({ name: "all-notes" });
          }}
        >
          <Trash2 size={14} /> Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
