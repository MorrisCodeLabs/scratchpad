import type { ReactNode } from "react";
import { FileText, Users, Rocket, BookOpen, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NOTE_TEMPLATES, type NoteTemplate } from "@/lib/note-templates";
import { useWorkspaceContext } from "@/lib/workspace-context";

const ICONS: Record<NoteTemplate["iconName"], LucideIcon> = {
  blank: FileText,
  meeting: Users,
  project: Rocket,
  journal: BookOpen,
};

export function NewNoteMenu({
  folderId = null,
  children,
}: {
  folderId?: string | null;
  children: ReactNode;
}) {
  const { workspace, notes, navigate } = useWorkspaceContext();

  const create = async (template: NoteTemplate) => {
    const note = await notes.createNote(workspace.id, folderId);
    if (!note) return;
    await notes.updateNote(note.id, { content: template.content as never, title: template.title });
    navigate({ name: "note", id: note.id });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {NOTE_TEMPLATES.map((template) => {
          const Icon = ICONS[template.iconName];
          return (
            <DropdownMenuItem key={template.id} onSelect={() => create(template)} className="items-start gap-2.5 py-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2 text-muted">
                <Icon size={14} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{template.name}</span>
                <span className="block text-xs text-faint">{template.description}</span>
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
