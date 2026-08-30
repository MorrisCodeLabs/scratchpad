import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { NoteLinkMenu, type NoteLinkMenuHandle } from "@/components/editor/NoteLinkMenu";
import type { NoteLinkStorage } from "@/lib/editor/note-link";

const suggestion: Omit<SuggestionOptions, "editor"> = {
  pluginKey: new PluginKey("noteLinkSuggestion"),
  char: "[[",
  startOfLine: false,
  items: ({ editor, query }) => {
    const storage = editor.storage.noteLink as NoteLinkStorage | undefined;
    const currentNoteId = editor.storage.noteContext?.noteId;
    return (storage?.notes ?? [])
      .filter((n) => n.id !== currentNoteId && n.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  },
  command: ({ editor, range, props }: any) => {
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent({ type: "noteLink", attrs: { noteId: props.id, label: props.title || "Untitled" } })
      .insertContent(" ")
      .run();
  },
  render: () => {
    let component: ReactRenderer<NoteLinkMenuHandle>;
    let popup: TippyInstance[];

    return {
      onStart: (props) => {
        component = new ReactRenderer(NoteLinkMenu, { props, editor: props.editor });
        if (!props.clientRect) return;
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate(props) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },
      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

export const NoteLinkCommand = Extension.create({
  name: "noteLinkCommand",
  addOptions() {
    return { suggestion };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
