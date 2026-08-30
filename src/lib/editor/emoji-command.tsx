import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { EMOJI_LIST } from "@/lib/editor/emoji-list";
import { EmojiMenu, type EmojiMenuHandle } from "@/components/editor/EmojiMenu";

const suggestion: Omit<SuggestionOptions, "editor"> = {
  pluginKey: new PluginKey("emojiCommandSuggestion"),
  char: ":",
  startOfLine: false,
  items: ({ query }) =>
    query.length === 0
      ? EMOJI_LIST.slice(0, 18)
      : EMOJI_LIST.filter((e) => e.name.includes(query.toLowerCase())).slice(0, 18),
  command: ({ editor, range, props }: any) => {
    editor.chain().focus().deleteRange(range).insertContent(props.char + " ").run();
  },
  render: () => {
    let component: ReactRenderer<EmojiMenuHandle>;
    let popup: TippyInstance[];

    return {
      onStart: (props) => {
        component = new ReactRenderer(EmojiMenu, { props, editor: props.editor });
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

export const EmojiCommand = Extension.create({
  name: "emojiCommand",
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
