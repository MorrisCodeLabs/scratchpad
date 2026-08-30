import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Star, Plus, Pencil, Trash2 } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Folder as FolderType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { DropZone } from "@/components/sidebar/DropZone";
import { NoteRow } from "@/components/sidebar/NoteRow";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function FolderNode({ folder, depth }: { folder: FolderType; depth: number }) {
  const { folders, notes, route, navigate } = useWorkspaceContext();
  const [open, setOpen] = useState(depth === 0);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(folder.name);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `folder:${folder.id}` });

  const childFolders = useMemo(
    () => folders.folders.filter((f) => f.parent_id === folder.id),
    [folders.folders, folder.id],
  );
  const childNotes = useMemo(
    () => notes.notes.filter((n) => n.folder_id === folder.id),
    [notes.notes, folder.id],
  );

  const commitRename = () => {
    setRenaming(false);
    const trimmed = name.trim() || "Untitled";
    setName(trimmed);
    if (trimmed !== folder.name) folders.renameFolder(folder.id, trimmed);
  };

  return (
    <div style={{ opacity: isDragging ? 0.4 : 1 }}>
      <DropZone id={`folder:${folder.id}`} className="group relative rounded-md">
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={{ paddingLeft: `${depth * 14}px` }}
          className="flex items-center gap-1 rounded-md pr-1 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          <button type="button" onClick={() => setOpen((v) => !v)} className="p-1">
            <ChevronRight size={13} className={cn("transition-transform", open && "rotate-90")} />
          </button>
          {open ? <FolderOpen size={14} /> : <Folder size={14} />}
          {renaming ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => e.key === "Enter" && commitRename()}
              className="min-w-0 flex-1 rounded border border-line bg-surface px-1 py-0.5 text-sm outline-none"
            />
          ) : (
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 truncate py-1.5 text-left">
              {folder.name}
            </button>
          )}
          {folder.is_favorite && <Star size={11} className="shrink-0 fill-current text-warn" />}

          <div className="hidden items-center gap-0.5 group-hover:flex">
            <button
              type="button"
              title="New note in folder"
              onClick={async () => {
                const note = await notes.createNote(folder.workspace_id, folder.id);
                if (note) navigate({ name: "note", id: note.id });
              }}
              className="text-faint hover:text-ink"
            >
              <Plus size={13} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="text-faint hover:text-ink">
                  <MoreHorizontal size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={() => setRenaming(true)}>
                  <Pencil size={13} /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => folders.toggleFavorite(folder.id, !folder.is_favorite)}>
                  <Star size={13} /> {folder.is_favorite ? "Remove from favorites" : "Add to favorites"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger" onSelect={() => folders.deleteFolder(folder.id)}>
                  <Trash2 size={13} /> Delete folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </DropZone>

      {open && (
        <div>
          {childFolders.map((f) => (
            <FolderNode key={f.id} folder={f} depth={depth + 1} />
          ))}
          {childNotes.map((n) => (
            <NoteRow key={n.id} note={n} active={route.name === "note" && route.id === n.id} indent={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
