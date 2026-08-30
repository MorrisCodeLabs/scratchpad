import { useState } from "react";
import { MoreHorizontal, Pin, Star, Copy, Archive, Trash2, History, Download, FileDown, FileText } from "lucide-react";
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
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { ProBadge } from "@/components/pro/ProBadge";
import type { Note } from "@/lib/types";

export function NoteMenu({
  note,
  onOpenVersionHistory,
  onExportMarkdown,
  onExportPdf,
}: {
  note: Note;
  onOpenVersionHistory: () => void;
  onExportMarkdown: () => void;
  onExportPdf: () => void;
}) {
  const { notes, navigate } = useWorkspaceContext();
  const isPro = useIsPro();
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);

  const gated = (feature: string, action: () => void) => () => {
    if (isPro) action();
    else setUpgradeFeature(feature);
  };

  return (
    <>
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
          <DropdownMenuItem onSelect={gated("Version history", onOpenVersionHistory)}>
            <History size={14} /> Version history
            {!isPro && <ProBadge className="ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-2">
              <Download size={14} /> Export
              {!isPro && <ProBadge className="ml-auto" />}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={gated("Export", onExportMarkdown)}>
                <FileText size={14} /> Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={gated("Export", onExportPdf)}>
                <FileDown size={14} /> PDF
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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

      <UpgradeDialog
        open={upgradeFeature !== null}
        onOpenChange={(open) => !open && setUpgradeFeature(null)}
        feature={upgradeFeature ?? undefined}
      />
    </>
  );
}
