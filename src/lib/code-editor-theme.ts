import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Reads Scratchpad's own --sp-* CSS custom properties (src/styles/global.css)
// rather than a canned CodeMirror theme, so the editor stays in sync with
// the app's light/dark toggle and any workspace brand-accent override for
// free — no separate dark-mode variant to maintain.
const baseTheme = EditorView.theme({
  "&": {
    color: "var(--sp-ink)",
    backgroundColor: "var(--sp-surface)",
    fontSize: "13px",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: "var(--sp-font-mono)",
    caretColor: "var(--sp-accent)",
    padding: "16px 0",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--sp-accent)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--sp-accent-soft)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--sp-surface)",
    color: "var(--sp-faint)",
    border: "none",
    borderRight: "1px solid var(--sp-line)",
  },
  ".cm-activeLine": { backgroundColor: "var(--sp-surface-2)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--sp-surface-2)", color: "var(--sp-muted)" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 14px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--sp-font-mono)", lineHeight: "1.6" },
  ".cm-matchingBracket, .cm-nonmatchingBracket": {
    backgroundColor: "var(--sp-accent-soft)",
    outline: "1px solid var(--sp-accent)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--sp-surface)",
    border: "1px solid var(--sp-line)",
    color: "var(--sp-ink)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--sp-accent-soft)",
    color: "var(--sp-accent-ink)",
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "var(--sp-faint)", fontStyle: "italic" },
  { tag: t.lineComment, color: "var(--sp-faint)", fontStyle: "italic" },
  { tag: t.blockComment, color: "var(--sp-faint)", fontStyle: "italic" },
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--sp-accent)", fontWeight: "600" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "var(--sp-good)" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--sp-warn)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "var(--sp-accent-ink)" },
  { tag: [t.typeName, t.className, t.namespace], color: "var(--sp-accent-ink)" },
  { tag: t.propertyName, color: "var(--sp-ink)" },
  { tag: t.variableName, color: "var(--sp-ink)" },
  { tag: [t.operator, t.punctuation, t.bracket, t.separator], color: "var(--sp-muted)" },
  { tag: t.invalid, color: "var(--sp-danger)", textDecoration: "underline wavy" },
  { tag: t.tagName, color: "var(--sp-accent)" },
  { tag: t.attributeName, color: "var(--sp-accent-ink)" },
  { tag: t.meta, color: "var(--sp-faint)" },
]);

export const scratchpadCodeTheme = [baseTheme, syntaxHighlighting(highlightStyle)];
