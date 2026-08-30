import { Extension } from "@tiptap/core";

// Threads the current note's workspace/note IDs into the editor instance so
// extensions and slash-menu commands (which only receive `editor` and
// `range`, not React props) can reach them via `editor.storage.noteContext`
// — needed by the upload commands to build the storage path.
export const NoteContext = Extension.create<{ workspaceId: string; noteId: string }>({
  name: "noteContext",

  addOptions() {
    return { workspaceId: "", noteId: "" };
  },

  addStorage() {
    return {
      workspaceId: this.options.workspaceId,
      noteId: this.options.noteId,
    };
  },

  onCreate() {
    this.storage.workspaceId = this.options.workspaceId;
    this.storage.noteId = this.options.noteId;
  },
});
