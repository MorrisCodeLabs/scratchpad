import * as React from "react";
import { StatusPicker } from "@/components/editor/StatusPicker";
import { NoteDetailsPanel } from "@/components/editor/NoteDetailsPanel";
import { ReminderControl } from "@/components/editor/ReminderControl";
import { ExpirationControl } from "@/components/editor/ExpirationControl";
import { BacklinksPanel } from "@/components/editor/BacklinksPanel";
import { CommentsPanel } from "@/components/editor/CommentsPanel";
import { CitationsPanel } from "@/components/editor/CitationsPanel";
import type { Editor } from "@tiptap/react";
import type { Note, NoteSource } from "@/lib/types";
import type { NoteSourceInput } from "@/lib/data/use-note-sources";

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <p className="px-3 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <div className="flex flex-col divide-y divide-line/60">{children}</div>
    </div>
  );
}

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
      <PanelSection label="Properties">
        <StatusPicker note={note} />
        <NoteDetailsPanel color={color} description={description} tags={tags} onChange={onDetailsChange} />
        <ReminderControl reminderAt={reminderAt} onSetReminder={onSetReminder} />
        <ExpirationControl expiresAt={expiresAt} onSetExpiration={onSetExpiration} />
      </PanelSection>
      <PanelSection label="Related">
        <BacklinksPanel note={note} allNotes={allNotes} onNavigate={onNavigate} />
        <CommentsPanel noteId={note.id} workspaceId={workspaceId} currentUserId={currentUserId} />
        <CitationsPanel editor={editor} sources={sources} onAddSource={onAddSource} onDeleteSource={onDeleteSource} />
      </PanelSection>
    </div>
  );
}
