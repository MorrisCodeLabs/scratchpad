import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DatabaseBlockView } from "@/components/editor/DatabaseBlockView";

export type DbColumnType = "text" | "number" | "select" | "checkbox" | "date";

export interface DbColumn {
  id: string;
  name: string;
  type: DbColumnType;
  options?: string[];
}

export interface DbRow {
  id: string;
  cells: Record<string, string | number | boolean | null>;
}

export interface DbData {
  columns: DbColumn[];
  rows: DbRow[];
}

export const DEFAULT_DB_DATA: DbData = {
  columns: [
    { id: "c1", name: "Name", type: "text" },
    { id: "c2", name: "Status", type: "select", options: ["Not started", "In progress", "Done"] },
  ],
  rows: [],
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    databaseBlock: {
      setDatabaseBlock: () => ReturnType;
    };
  }
}

export const DatabaseBlock = Node.create({
  name: "databaseBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      data: {
        default: DEFAULT_DB_DATA,
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute("data-db") ?? "null") ?? DEFAULT_DB_DATA;
          } catch {
            return DEFAULT_DB_DATA;
          }
        },
        renderHTML: (attributes) => ({ "data-db": JSON.stringify(attributes.data) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="database-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "database-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DatabaseBlockView);
  },

  addCommands() {
    return {
      setDatabaseBlock:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { data: DEFAULT_DB_DATA } }),
    };
  },
});
