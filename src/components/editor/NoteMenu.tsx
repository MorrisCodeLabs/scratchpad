import { MoreHorizontal, Pin, Star, Copy, Archive, Trash2, Lock, Unlock, Download, FileText, FileType, Globe, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Note } from "@/lib/types";

export function NoteMenu({
  note,
  onToggleLock,
  onExportMarkdown,
  onExportText,
  onOpenShare,
  onOpenVersionHistory,
}: {
  note: Note;
  onToggleLock: () => void;
  onExportMarkdown: () => void;
  onExportText: () => void;
  onOpenShare: () => void;
  onOpenVersionHistory: () => void;
}) {
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
        <DropdownMenuItem onSelect={() => setTimeout(onToggleLock, 0)}>
          {note.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
          {note.is_locked ? "Unlock note" : "Lock note (read-only)"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onOpenVersionHistory}>
          <History size={14} /> Version history
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-2">
            <Download size={14} /> Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={onExportMarkdown}>
              <FileText size={14} /> Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onExportText}>
              <FileType size={14} /> Plain text (.txt)
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onOpenShare}>
          <Globe size={14} /> Share to web
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
