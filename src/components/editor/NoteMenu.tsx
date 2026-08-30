import { MoreHorizontal, Pin, Star, Copy, Archive, Trash2, History, Download, FileDown, FileText, Lock, Unlock, BookmarkPlus, Globe, ShieldOff, ShieldCheck, GraduationCap, Columns2 } from "lucide-react";
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
import { useIsPro } from "@/lib/use-plan";
import type { Note } from "@/lib/types";

export function NoteMenu({
  note,
  onOpenVersionHistory,
  onExportMarkdown,
  onExportPdf,
  onToggleLock,
  onSaveAsTemplate,
  onOpenShare,
  isEncrypted,
  unlocked,
  onEncrypt,
  onRemoveEncryption,
  onOpenStudyMode,
  onSplitRight,
}: {
  note: Note;
  onOpenVersionHistory: () => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
  onToggleLock: () => void;
  onSaveAsTemplate: () => void;
  onOpenShare: () => void;
  isEncrypted: boolean;
  unlocked: boolean;
  onEncrypt: () => void;
  onRemoveEncryption: () => void;
  onOpenStudyMode: () => void;
  onSplitRight: () => void;
}) {
  const { notes, navigate } = useWorkspaceContext();
  const isPro = useIsPro();

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
        <DropdownMenuItem onSelect={onToggleLock}>
          {note.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
          {note.is_locked ? "Unlock note" : "Lock note (read-only)"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isPro && (
          <DropdownMenuItem onSelect={onOpenVersionHistory}>
            <History size={14} /> Version history
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-2">
            <Download size={14} /> Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={onExportMarkdown}>
              <FileText size={14} /> Markdown (.md)
            </DropdownMenuItem>
            {isPro && (
              <DropdownMenuItem onSelect={onExportPdf}>
                <FileDown size={14} /> PDF
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {isPro && (
          <DropdownMenuItem onSelect={onSaveAsTemplate}>
            <BookmarkPlus size={14} /> Save as template
          </DropdownMenuItem>
        )}
        {isPro && (
          <DropdownMenuItem onSelect={onOpenStudyMode}>
            <GraduationCap size={14} /> Study flashcards
          </DropdownMenuItem>
        )}
        {isPro && (
          <DropdownMenuItem onSelect={onOpenShare}>
            <Globe size={14} /> Share to web
          </DropdownMenuItem>
        )}
        {isPro && (
          <DropdownMenuItem onSelect={onSplitRight}>
            <Columns2 size={14} /> Split right
          </DropdownMenuItem>
        )}
        {isPro &&
          (isEncrypted ? (
            unlocked && (
              <DropdownMenuItem onSelect={onRemoveEncryption}>
                <ShieldOff size={14} /> Remove encryption
              </DropdownMenuItem>
            )
          ) : (
            <DropdownMenuItem onSelect={onEncrypt}>
              <ShieldCheck size={14} /> Encrypt note
            </DropdownMenuItem>
          ))}
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
