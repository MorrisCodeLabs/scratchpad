import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Star, Plus, Pencil, Trash2, Ban } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Folder as FolderType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { DropZone } from "@/components/sidebar/DropZone";
import { NoteRow } from "@/components/sidebar/NoteRow";
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
import { NewNoteMenu } from "@/components/NewNoteMenu";

const FOLDER_COLORS = [
  { name: "None", value: null },
  { name: "Red", value: "#c0362c" },
  { name: "Orange", value: "#b3711c" },
  { name: "Green", value: "#2f7a4f" },
  { name: "Blue", value: "#2954a5" },
  { name: "Purple", value: "#7a4fae" },
];

export function FolderNode({ folder, depth }: { folder: FolderType; depth: number }) {
  const { folders, notes, route } = useWorkspaceContext();
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
      <DropZone id={`folder:${folder.id}`} className="group relative rounded-lg">
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={{ paddingLeft: `${depth * 14}px` }}
          className="flex items-center gap-1 rounded-lg pr-1.5 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <button type="button" onClick={() => setOpen((v) => !v)} className="p-1.5">
            <ChevronRight size={13} className={cn("transition-transform", open && "rotate-90")} />
          </button>
          <span className="mr-2 flex shrink-0 items-center" style={{ color: folder.color ?? undefined }}>
            {open ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
          {renaming ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => e.key === "Enter" && commitRename()}
              className="min-w-0 flex-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[13px] outline-none"
            />
          ) : (
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex-1 truncate py-2 text-left">
              {folder.name}
            </button>
          )}
          {folder.is_favorite && <Star size={11} className="shrink-0 fill-current text-warn" />}

          <div className="hidden items-center gap-0.5 group-hover:flex">
            <NewNoteMenu folderId={folder.id}>
              <button type="button" title="New note in folder" className="text-faint transition-colors hover:text-ink">
                <Plus size={13} />
              </button>
            </NewNoteMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="text-faint transition-colors hover:text-ink">
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
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink outline-none data-[highlighted]:bg-surface-2">
                    <span
                      className="h-3 w-3 rounded-full border border-line"
                      style={{ background: folder.color ?? "transparent" }}
                    />
                    Color
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="flex items-center gap-1.5 p-2">
                    {FOLDER_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        onClick={() => folders.setFolderColor(folder.id, c.value)}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border border-line",
                          folder.color === c.value && "ring-2 ring-accent ring-offset-1",
                        )}
                        style={{ background: c.value ?? "transparent" }}
                      >
                        {!c.value && <Ban size={12} className="text-faint" />}
                      </button>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
            <NoteRow
              key={n.id}
              note={n}
              active={route.name === "note" && route.id === n.id}
              indent={depth + 1}
              reorderable
            />
          ))}
        </div>
      )}
    </div>
  );
}
