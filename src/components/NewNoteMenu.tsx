import type { ReactNode } from "react";
import { Users, Rocket, BookOpen, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NOTE_TEMPLATES, type NoteTemplate } from "@/lib/note-templates";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useCustomTemplates } from "@/lib/data/use-custom-templates";
import type { CustomNoteTemplate } from "@/lib/types";

const ICONS: Record<NoteTemplate["iconName"], LucideIcon> = {
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
  const { templates: customTemplates, deleteTemplate } = useCustomTemplates(workspace.id);

  const create = async (template: NoteTemplate) => {
    const note = await notes.createNote(workspace.id, folderId);
    if (!note) return;
    await notes.updateNote(note.id, { content: template.content as never, title: template.title });
    navigate({ name: "note", id: note.id });
  };

  const createFromCustom = async (template: CustomNoteTemplate) => {
    const note = await notes.createNote(workspace.id, folderId);
    if (!note) return;
    await notes.updateNote(note.id, { content: template.content as never, title: template.name });
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
                <span className="block text-sm font-medium text-ink">{template.title}</span>
                <span className="block text-xs text-faint">{template.description}</span>
              </span>
            </DropdownMenuItem>
          );
        })}

        {customTemplates.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-faint">Your templates</p>
            {customTemplates.map((template) => (
              <DropdownMenuItem key={template.id} onSelect={() => createFromCustom(template)} className="group items-start gap-2.5 py-2">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-accent-soft text-accent-ink">
                  <Sparkles size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{template.name}</span>
                </span>
                <button
                  type="button"
                  title="Delete template"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTemplate(template.id);
                  }}
                  className="hidden shrink-0 text-faint hover:text-danger group-hover:block"
                >
                  <Trash2 size={13} />
                </button>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
