import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { supabase } from "@/lib/supabase";

export function WorkspaceMenu() {
  const { workspace, navigate } = useWorkspaceContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-surface-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-sm">
            {workspace.icon ?? "📝"}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{workspace.name}</span>
          <ChevronsUpDown size={13} className="text-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onSelect={() => navigate({ name: "settings" })}>
          <Settings size={14} /> Workspace settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => supabase.auth.signOut()}>
          <LogOut size={14} /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
