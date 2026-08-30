import { Extension } from "@tiptap/core";

export interface ProContextStorage {
  isPro: boolean;
}

// Threads Pro-plan status into the editor instance so the slash-menu
// (which only receives `editor` and `query`) can filter out Pro-only
// blocks without needing React props.
export const ProContext = Extension.create<Record<string, never>, ProContextStorage>({
  name: "proContext",

  addStorage() {
    return { isPro: false };
  },
});
