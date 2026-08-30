import { Extension } from "@tiptap/core";

export interface ProContextStorage {
  isPro: boolean;
  requestUpgrade: (feature: string) => void;
}

// Threads Pro-plan status into the editor instance so slash-menu commands
// (which only receive `editor` and `range`) can gate Pro-only block
// insertion without needing React props.
export const ProContext = Extension.create<Record<string, never>, ProContextStorage>({
  name: "proContext",

  addStorage() {
    return { isPro: false, requestUpgrade: () => {} };
  },
});
