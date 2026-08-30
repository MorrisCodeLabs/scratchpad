import { useMemo, useState } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Pin, Star, Calendar, Trash2, Settings, Plus, Search, FolderPlus, ChevronDown, BarChart3, type LucideIcon } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { FolderNode } from "@/components/sidebar/FolderNode";
import { NoteRow } from "@/components/sidebar/NoteRow";
import { DropZone } from "@/components/sidebar/DropZone";
import { WorkspaceMenu } from "@/components/sidebar/WorkspaceMenu";
import { NewNoteMenu } from "@/components/NewNoteMenu";
import { ProBadge } from "@/components/pro/ProBadge";
import { useIsPro } from "@/lib/use-plan";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const { folders, notes, route, navigate, setCommandMenuOpen } = useWorkspaceContext();
  const isPro = useIsPro();
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const pinned = useMemo(() => notes.notes.filter((n) => n.is_pinned), [notes.notes]);
  const favoriteNotes = useMemo(() => notes.notes.filter((n) => n.is_favorite), [notes.notes]);
  const favoriteFolders = useMemo(() => folders.folders.filter((f) => f.is_favorite), [folders.folders]);
  const rootFolders = useMemo(() => folders.folders.filter((f) => f.parent_id === null), [folders.folders]);
  const rootNotes = useMemo(
    () => notes.notes.filter((n) => n.folder_id === null),
    [notes.notes],
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const [activeType, activeId] = String(active.id).split(":");
    const [overType, overId] = String(over.id).split(":");
    const targetFolderId = overType === "folder" ? overId : overType === "root" ? null : undefined;
    if (targetFolderId === undefined) return;

    if (activeType === "note") {
      await notes.updateNote(activeId, { folder_id: targetFolderId });
    } else if (activeType === "folder" && activeId !== targetFolderId) {
      const maxOrder = folders.folders
        .filter((f) => f.parent_id === targetFolderId)
        .reduce((max, f) => Math.max(max, f.sort_order), 0);
      await folders.moveFolder(activeId, targetFolderId, maxOrder + 1);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <WorkspaceMenu />
        </div>

        <div className="flex flex-col gap-0.5 px-3">
          <button
            type="button"
            onClick={() => setCommandMenuOpen(true)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Search size={15} className="shrink-0 text-faint" />
            Search
            <kbd className="ml-auto rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-faint">
              ⌘K
            </kbd>
          </button>
          <NewNoteMenu>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Plus size={15} className="shrink-0 text-faint" />
              New note
            </button>
          </NewNoteMenu>
        </div>

        <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
          {pinned.length > 0 && (
            <div className="mb-4">
              <p className="flex items-center gap-1.5 px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint">
                <Pin size={11} /> Pinned
              </p>
              {pinned.map((n) => (
                <NoteRow key={n.id} note={n} active={route.name === "note" && route.id === n.id} indent={0} />
              ))}
            </div>
          )}

          {(favoriteNotes.length > 0 || favoriteFolders.length > 0) && (
            <div className="mb-4">
              <button
                onClick={() => setFavoritesOpen((v) => !v)}
                className="flex w-full items-center gap-1.5 px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint"
              >
                <Star size={11} /> Favorites
                <ChevronDown size={12} className={cn("transition-transform", favoritesOpen ? "" : "-rotate-90")} />
              </button>
              {favoritesOpen && (
                <>
                  {favoriteFolders.map((f) => (
                    <FolderNode key={f.id} folder={f} depth={0} />
                  ))}
                  {favoriteNotes.map((n) => (
                    <NoteRow key={n.id} note={n} active={route.name === "note" && route.id === n.id} indent={0} />
                  ))}
                </>
              )}
            </div>
          )}

          <div className="mb-1.5 flex items-center justify-between px-2.5">
            <button
              onClick={() => setFoldersOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint"
            >
              Notes
              <ChevronDown size={12} className={cn("transition-transform", foldersOpen ? "" : "-rotate-90")} />
            </button>
            <button
              type="button"
              title="New folder"
              onClick={() => folders.createFolder("New Folder", null)}
              className="text-faint transition-colors hover:text-ink"
            >
              <FolderPlus size={13} />
            </button>
          </div>

          {foldersOpen && (
            <DropZone id="root:root" className="min-h-[1rem] rounded-lg">
              {rootFolders.map((f) => (
                <FolderNode key={f.id} folder={f} depth={0} />
              ))}
              {rootNotes.map((n) => (
                <NoteRow key={n.id} note={n} active={route.name === "note" && route.id === n.id} indent={0} />
              ))}
            </DropZone>
          )}
        </nav>

        <div className="flex flex-col gap-0.5 border-t border-line px-3 py-3">
          <SidebarLink
            icon={Calendar}
            label="Calendar"
            active={route.name === "calendar"}
            onClick={() => navigate({ name: "calendar" })}
          />
          <SidebarLink
            icon={BarChart3}
            label="Insights"
            active={route.name === "insights"}
            onClick={() => navigate({ name: "insights" })}
            badge={!isPro}
          />
          <SidebarLink
            icon={Trash2}
            label="Trash"
            active={route.name === "trash"}
            onClick={() => navigate({ name: "trash" })}
          />
          <SidebarLink
            icon={Settings}
            label="Settings"
            active={route.name === "settings"}
            onClick={() => navigate({ name: "settings" })}
          />
        </div>
      </aside>
    </DndContext>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
        active ? "bg-accent-soft font-medium text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon size={15} className="shrink-0" />
      {label}
      {badge && <ProBadge className="ml-auto" />}
    </button>
  );
}
