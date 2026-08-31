import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  Pin,
  Star,
  Clock,
  Trash2,
  Settings,
  Plus,
  Search,
  FolderPlus,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
  History,
  Code2,
  Sparkles,
} from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Route } from "@/lib/use-router";
import { useSession } from "@/lib/data/use-session";
import { useEffectivePlan, useIsOwnerAccount } from "@/lib/use-plan";
import { useTheme } from "@/lib/use-theme";
import { supabase } from "@/lib/supabase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FolderNode } from "@/components/sidebar/FolderNode";
import { NoteRow } from "@/components/sidebar/NoteRow";
import { DropZone } from "@/components/sidebar/DropZone";
import { WorkspaceMenu } from "@/components/sidebar/WorkspaceMenu";
import { NewNoteMenu } from "@/components/NewNoteMenu";
import { cn } from "@/lib/cn";

const COLLAPSED_KEY = "scratchpad:sidebar-collapsed";

export function Sidebar() {
  const { folders, notes, route, navigate, setCommandMenuOpen } = useWorkspaceContext();
  const { session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const plan = useEffectivePlan();
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(() => typeof window !== "undefined" && localStorage.getItem(COLLAPSED_KEY) === "1");

  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const pinned = useMemo(() => notes.notes.filter((n) => n.is_pinned), [notes.notes]);
  const recent = useMemo(
    () =>
      [...notes.notes]
        .filter((n) => n.last_viewed_at)
        .sort((a, b) => new Date(b.last_viewed_at!).getTime() - new Date(a.last_viewed_at!).getTime())
        .slice(0, 5),
    [notes.notes],
  );
  const favoriteNotes = useMemo(() => notes.notes.filter((n) => n.is_favorite), [notes.notes]);
  const favoriteFolders = useMemo(() => folders.folders.filter((f) => f.is_favorite), [folders.folders]);
  const rootFolders = useMemo(() => folders.folders.filter((f) => f.parent_id === null), [folders.folders]);
  const rootNotes = useMemo(
    () => notes.notes.filter((n) => n.folder_id === null),
    [notes.notes],
  );

  const email = session?.user.email ?? "";
  const initial = email ? email[0].toUpperCase() : "?";

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const [activeType, activeId] = String(active.id).split(":");
    const [overType, overId] = String(over.id).split(":");

    if (activeType === "note" && overType === "note") {
      if (activeId === overId) return;
      await notes.reorderNote(activeId, overId);
      return;
    }

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

  if (collapsed) {
    return (
      <aside className="flex h-full w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3">
        <IconRailButton label="Expand sidebar" onClick={() => setCollapsed(false)}>
          <PanelLeftOpen size={16} />
        </IconRailButton>
        <div className="my-1 h-px w-6 bg-line" />
        <IconRailButton label="Search (⌘K)" onClick={() => setCommandMenuOpen(true)}>
          <Search size={16} />
        </IconRailButton>
        <NewNoteMenu>
          <IconRailButton label="New note" onClick={() => {}}>
            <Plus size={16} />
          </IconRailButton>
        </NewNoteMenu>
        <IconRailButton label="Code Editor" active={route.name === "code"} onClick={() => navigate({ name: "code" })}>
          <Code2 size={16} />
        </IconRailButton>
        <div className="mt-auto flex flex-col items-center gap-1">
          <IconRailButton label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </IconRailButton>
          <AccountMenu email={email} navigate={navigate}>
            <button
              type="button"
              title={email}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink transition-opacity hover:opacity-80"
            >
              {initial}
            </button>
          </AccountMenu>
        </div>
      </aside>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center justify-between gap-1 px-4 pb-3 pt-4">
          <WorkspaceMenu />
          <button
            type="button"
            title="Collapse sidebar"
            onClick={() => setCollapsed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <PanelLeftClose size={15} />
          </button>
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
          <button
            type="button"
            onClick={() => navigate({ name: "code" })}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
              route.name === "code" ? "bg-accent-soft text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Code2 size={15} className="shrink-0 text-faint" />
            Code Editor
            {plan === "free" && (
              <span className="ml-auto flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                <Sparkles size={10} /> Pro
              </span>
            )}
          </button>
        </div>

        <nav className="mt-3 flex-1 overflow-y-auto px-3 pb-3">
          {recent.length > 0 && (
            <div className="mb-4">
              <p className="flex items-center gap-1.5 px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-faint">
                <Clock size={11} /> Recent
              </p>
              {recent.map((n) => (
                <NoteRow key={n.id} note={n} active={route.name === "note" && route.id === n.id} indent={0} reorderable={false} />
              ))}
            </div>
          )}

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
                <NoteRow
                  key={n.id}
                  note={n}
                  active={route.name === "note" && route.id === n.id}
                  indent={0}
                  reorderable
                />
              ))}
            </DropZone>
          )}
        </nav>

        <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
          <AccountMenu email={email} navigate={navigate}>
            <button
              type="button"
              title="Account"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-surface-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-ink">{email || "Account"}</span>
              </span>
            </button>
          </AccountMenu>
          <button
            type="button"
            title="Toggle theme"
            onClick={toggleTheme}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            type="button"
            title="Collapse sidebar"
            onClick={() => setCollapsed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>
      </aside>
    </DndContext>
  );
}

function AccountMenu({
  email,
  navigate,
  children,
}: {
  email: string;
  navigate: (route: Route) => void;
  children: ReactNode;
}) {
  const plan = useEffectivePlan();
  const isOwner = useIsOwnerAccount();
  const planLabel = plan === "team" ? "Team" : plan === "pro" ? "Pro" : "Free";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-60">
        <div className="px-2.5 py-1.5">
          <p className="truncate text-xs font-medium text-ink">{email || "Account"}</p>
          <p className="text-[10.5px] text-faint">{planLabel} plan{isOwner ? " · Owner" : ""}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ name: "trash" })}>
          <Trash2 size={14} /> Trash
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate({ name: "settings" })}>
          <Settings size={14} /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate({ name: "changelog" })}>
          <History size={14} /> Changelog
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-danger" onSelect={() => supabase.auth.signOut()}>
          <LogOut size={14} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IconRailButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
        active ? "bg-accent-soft text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
