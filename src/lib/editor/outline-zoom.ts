import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PMNode } from "@tiptap/pm/model";

export interface ZoomRange {
  from: number;
  to: number;
}

// Finds the heading node at `headingPos` and returns the position range
// covering it plus everything up to (but not including) the next heading
// at the same or a shallower level — i.e. "this section". Only considers
// direct doc children, which covers the common case of headings not
// nested inside another block (blockquote, callout, toggle, ...).
export function computeZoomRange(doc: PMNode, headingPos: number): ZoomRange | null {
  const children: { node: PMNode; pos: number }[] = [];
  doc.forEach((node, pos) => children.push({ node, pos }));

  const idx = children.findIndex((c) => c.pos === headingPos);
  if (idx === -1 || children[idx].node.type.name !== "heading") return null;

  const level = children[idx].node.attrs.level;
  let to = doc.content.size;
  for (let i = idx + 1; i < children.length; i++) {
    const c = children[i];
    if (c.node.type.name === "heading" && c.node.attrs.level <= level) {
      to = c.pos;
      break;
    }
  }
  return { from: headingPos, to };
}

const zoomPluginKey = new PluginKey<DecorationSet>("outlineZoom");

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    outlineZoom: {
      setOutlineZoom: (range: ZoomRange | null) => ReturnType;
    };
  }
}

export const OutlineZoom = Extension.create({
  name: "outlineZoom",

  addStorage() {
    return { range: null as ZoomRange | null };
  },

  addCommands() {
    return {
      setOutlineZoom:
        (range: ZoomRange | null) =>
        ({ editor, tr, dispatch }) => {
          editor.storage.outlineZoom.range = range;
          if (dispatch) {
            tr.setMeta(zoomPluginKey, true);
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: zoomPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            if (tr.docChanged && extension.storage.range) {
              extension.storage.range = {
                from: tr.mapping.map(extension.storage.range.from),
                to: tr.mapping.map(extension.storage.range.to),
              };
            } else if (!tr.getMeta(zoomPluginKey)) {
              return old;
            }
            const range: ZoomRange | null = extension.storage.range;
            if (!range) return DecorationSet.empty;
            const decorations: Decoration[] = [];
            tr.doc.forEach((node, pos) => {
              const end = pos + node.nodeSize;
              const overlaps = end > range.from && pos < range.to;
              if (!overlaps) {
                decorations.push(Decoration.node(pos, end, { class: "sp-zoom-hidden" }));
              }
            });
            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return zoomPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});
