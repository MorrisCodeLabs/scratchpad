import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { useWorkspaceContext } from "@/lib/workspace-context";

export function NewNoteMenu({
  folderId = null,
  children,
}: {
  folderId?: string | null;
  children: ReactNode;
}) {
  const { workspace, notes, navigate } = useWorkspaceContext();

  const create = async () => {
    const note = await notes.createNote(workspace.id, folderId);
    if (note) navigate({ name: "note", id: note.id });
  };

  if (isValidElement(children)) {
    return cloneElement(children as ReactElement<{ onClick?: () => void }>, { onClick: create });
  }
  return <span onClick={create}>{children}</span>;
}
