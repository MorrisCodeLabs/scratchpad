import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { marked } from "marked";

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function plainTextToHTML(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.(md|markdown|txt)$/i, "").trim() || "Untitled";
}

export function importedFileToTiptapJSON(filename: string, text: string): Record<string, unknown> {
  const isMarkdown = /\.mdx?$/i.test(filename);
  const html = isMarkdown ? (marked.parse(text) as string) : plainTextToHTML(text);

  const editor = new Editor({
    extensions: [StarterKit, Underline, Link, TaskList, TaskItem, Table, TableRow, TableHeader, TableCell],
    content: html,
  });
  const json = editor.getJSON();
  editor.destroy();
  return json as Record<string, unknown>;
}
