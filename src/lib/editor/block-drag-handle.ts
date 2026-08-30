import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

const dragHandlePluginKey = new PluginKey("blockDragHandle");

// Resolves the doc position at the very start of a top-level block element
// (a direct child of view.dom). Returns null instead of throwing if the DOM
// has drifted out of sync with the doc for any reason — a drag handle that
// silently does nothing beats one that crashes the editor.
function topLevelStart(view: EditorView, el: HTMLElement): number | null {
  try {
    const pos = view.posAtDOM(el, 0);
    const $pos = view.state.doc.resolve(pos);
    if ($pos.depth < 1) return null;
    return $pos.before(1);
  } catch {
    return null;
  }
}

class BlockDragHandleView {
  private view: EditorView;
  private wrapper: HTMLElement;
  private handle: HTMLElement;
  private indicator: HTMLElement;
  private hoveredPos: number | null = null;
  private dragging = false;
  private sourcePos: number | null = null;
  private dropPos: number | null = null;

  constructor(view: EditorView) {
    this.view = view;
    const wrapper = view.dom.parentElement;
    if (!wrapper) throw new Error("block-drag-handle: editor view has no parent element");
    this.wrapper = wrapper;
    if (getComputedStyle(wrapper).position === "static") wrapper.style.position = "relative";

    this.handle = document.createElement("div");
    this.handle.className = "sp-block-drag-handle";
    this.handle.setAttribute("aria-hidden", "true");
    this.handle.textContent = "⠿";
    wrapper.appendChild(this.handle);

    this.indicator = document.createElement("div");
    this.indicator.className = "sp-block-drop-indicator";
    wrapper.appendChild(this.indicator);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onHandleMouseDown = this.onHandleMouseDown.bind(this);
    this.onDragMouseMove = this.onDragMouseMove.bind(this);
    this.onDragMouseUp = this.onDragMouseUp.bind(this);

    wrapper.addEventListener("mousemove", this.onMouseMove);
    wrapper.addEventListener("mouseleave", this.onMouseLeave);
    this.handle.addEventListener("mousedown", this.onHandleMouseDown);
  }

  private blockAtY(clientY: number): { el: HTMLElement; pos: number } | null {
    const dom = this.view.dom;
    for (const child of Array.from(dom.children)) {
      const el = child as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        const pos = topLevelStart(this.view, el);
        if (pos === null) return null;
        return { el, pos };
      }
    }
    return null;
  }

  private onMouseMove(e: MouseEvent) {
    if (this.dragging || !this.view.editable) return;
    const found = this.blockAtY(e.clientY);
    if (!found) {
      this.hoveredPos = null;
      this.handle.classList.remove("visible");
      return;
    }
    this.hoveredPos = found.pos;
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const rect = found.el.getBoundingClientRect();
    this.handle.classList.add("visible");
    this.handle.style.top = `${rect.top - wrapperRect.top + rect.height / 2 - 9}px`;
  }

  private onMouseLeave() {
    if (this.dragging) return;
    this.handle.classList.remove("visible");
  }

  private onHandleMouseDown(e: MouseEvent) {
    e.preventDefault();
    if (this.hoveredPos === null || !this.view.editable) return;
    this.dragging = true;
    this.sourcePos = this.hoveredPos;
    document.addEventListener("mousemove", this.onDragMouseMove);
    document.addEventListener("mouseup", this.onDragMouseUp);
  }

  private onDragMouseMove(e: MouseEvent) {
    const dom = this.view.dom;
    const wrapperRect = this.wrapper.getBoundingClientRect();
    let gapY: number | null = null;
    let pos: number | null = null;

    for (const child of Array.from(dom.children)) {
      const el = child as HTMLElement;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (e.clientY < mid) {
        pos = topLevelStart(this.view, el);
        gapY = rect.top;
        break;
      }
    }
    if (pos === null) {
      const last = dom.lastElementChild as HTMLElement | null;
      if (last) {
        pos = this.view.state.doc.content.size;
        gapY = last.getBoundingClientRect().bottom;
      }
    }

    this.dropPos = pos;
    if (gapY !== null) {
      this.indicator.style.top = `${gapY - wrapperRect.top - 1}px`;
      this.indicator.classList.add("visible");
    }
  }

  private onDragMouseUp() {
    document.removeEventListener("mousemove", this.onDragMouseMove);
    document.removeEventListener("mouseup", this.onDragMouseUp);
    this.dragging = false;
    this.indicator.classList.remove("visible");

    try {
      const { sourcePos, dropPos } = this;
      if (sourcePos !== null && dropPos !== null) {
        const { state, dispatch } = this.view;
        const node = state.doc.resolve(sourcePos).nodeAfter;
        if (node) {
          const from = sourcePos;
          const to = from + node.nodeSize;
          const droppedInsideItself = dropPos > from && dropPos < to;
          if (!droppedInsideItself && dropPos !== from && dropPos !== to) {
            const tr = state.tr;
            tr.delete(from, to);
            tr.insert(tr.mapping.map(dropPos), node);
            dispatch(tr);
          }
        }
      }
    } catch {
      // Reordering failed (e.g. doc changed mid-drag) — no-op rather than crash.
    }

    this.sourcePos = null;
    this.dropPos = null;
  }

  destroy() {
    this.wrapper.removeEventListener("mousemove", this.onMouseMove);
    this.wrapper.removeEventListener("mouseleave", this.onMouseLeave);
    this.handle.removeEventListener("mousedown", this.onHandleMouseDown);
    document.removeEventListener("mousemove", this.onDragMouseMove);
    document.removeEventListener("mouseup", this.onDragMouseUp);
    this.handle.remove();
    this.indicator.remove();
  }
}

// Core (ungated): a hover-revealed grip handle next to each top-level block
// that lets you drag it to a new position in the note.
export const BlockDragHandle = Extension.create({
  name: "blockDragHandle",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: dragHandlePluginKey,
        view(editorView) {
          return new BlockDragHandleView(editorView);
        },
      }),
    ];
  },
});
