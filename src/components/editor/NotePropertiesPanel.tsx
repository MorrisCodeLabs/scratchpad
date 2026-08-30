import { StatusPicker } from "@/components/editor/StatusPicker";
import { NoteDetailsPanel } from "@/components/editor/NoteDetailsPanel";
import { ReminderControl } from "@/components/editor/ReminderControl";
import { ExpirationControl } from "@/components/editor/ExpirationControl";
import { BacklinksPanel } from "@/components/editor/BacklinksPanel";
import { CommentsPanel } from "@/components/editor/CommentsPanel";
import { CitationsPanel } from "@/components/editor/CitationsPanel";
import { CollapsibleSection } from "@/components/editor/CollapsibleSection";
import type { Editor } from "@tiptap/react";
import type { Note, NoteSource } from "@/lib/types";
import type { NoteSourceInput } from "@/lib/data/use-note-sources";

export function NotePropertiesPanel({
  note,
  color,
  description,
  tags,
  onDetailsChange,
  reminderAt,
  onSetReminder,
  expiresAt,
  onSetExpiration,
  allNotes,
  onNavigate,
  workspaceId,
  currentUserId,
  editor,
  sources,
  onAddSource,
  onDeleteSource,
}: {
  note: Note;
  color: string | null;
  description: string | null;
  tags: string[];
  onDetailsChange: (patch: { color?: string | null; description?: string | null; tags?: string[] }) => void;
  reminderAt: string | null;
  onSetReminder: (iso: string | null) => void;
  expiresAt: string | null;
  onSetExpiration: (iso: string | null) => void;
  allNotes: Note[];
  onNavigate: (id: string) => void;
  workspaceId: string;
  currentUserId: string;
  editor: Editor | null;
  sources: NoteSource[];
  onAddSource: (input: NoteSourceInput) => void;
  onDeleteSource: (id: string) => void;
}) {
  return (
    <div className="border-b border-line">
      <CollapsibleSection label="Properties">
        <div className="flex flex-col divide-y divide-line/60">
          <StatusPicker note={note} />
          <NoteDetailsPanel color={color} description={description} tags={tags} onChange={onDetailsChange} />
          <ReminderControl reminderAt={reminderAt} onSetReminder={onSetReminder} />
          <ExpirationControl expiresAt={expiresAt} onSetExpiration={onSetExpiration} />
        </div>
      </CollapsibleSection>
      <CollapsibleSection label="Related">
        <div className="flex flex-col divide-y divide-line/60">
          <BacklinksPanel note={note} allNotes={allNotes} onNavigate={onNavigate} />
          <CommentsPanel noteId={note.id} workspaceId={workspaceId} currentUserId={currentUserId} />
          <CitationsPanel editor={editor} sources={sources} onAddSource={onAddSource} onDeleteSource={onDeleteSource} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
