import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    definitionList: {
      setDefinitionList: () => ReturnType;
    };
  }
}

// Classic <dl>/<dt>/<dd> term-description pairs, entered as a single unit
// from the slash menu (one starter pair) and extended with Enter the same
// way a list item is.
export const DefinitionList = Node.create({
  name: "definitionList",
  group: "block",
  content: "definitionItem+",

  parseHTML() {
    return [{ tag: "dl" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["dl", mergeAttributes(HTMLAttributes, { class: "sp-definition-list" }), 0];
  },
  addCommands() {
    return {
      setDefinitionList:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              {
                type: "definitionItem",
                content: [
                  { type: "definitionTerm", content: [{ type: "text", text: "Term" }] },
                  { type: "definitionDescription", content: [{ type: "text", text: "Description" }] },
                ],
              },
            ],
          }),
    };
  },
});

export const DefinitionItem = Node.create({
  name: "definitionItem",
  content: "definitionTerm definitionDescription",
  parseHTML() {
    return [{ tag: 'div[data-type="definition-item"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "definition-item" }), 0];
  },
});

export const DefinitionTerm = Node.create({
  name: "definitionTerm",
  content: "inline*",
  parseHTML() {
    return [{ tag: "dt" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["dt", mergeAttributes(HTMLAttributes), 0];
  },
});

export const DefinitionDescription = Node.create({
  name: "definitionDescription",
  content: "inline*",
  parseHTML() {
    return [{ tag: "dd" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["dd", mergeAttributes(HTMLAttributes), 0];
  },
});
