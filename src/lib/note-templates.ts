export interface NoteTemplate {
  id: string;
  /** Shown as the menu item's label. */
  name: string;
  /** Set as the created note's initial title — empty for a truly blank note. */
  title: string;
  description: string;
  iconName: "blank" | "meeting" | "project" | "journal";
  content: Record<string, unknown>;
}

function doc(...content: Record<string, unknown>[]) {
  return { type: "doc", content };
}
function heading(level: number, text: string) {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}
function paragraph(text = "") {
  return text ? { type: "paragraph", content: [{ type: "text", text }] } : { type: "paragraph" };
}
function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((text) => ({
      type: "listItem",
      content: [paragraph(text)],
    })),
  };
}
function taskList(items: string[]) {
  return {
    type: "taskList",
    content: items.map((text) => ({
      type: "taskItem",
      attrs: { checked: false },
      content: [paragraph(text)],
    })),
  };
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    title: "",
    description: "Start with a blank page.",
    iconName: "blank",
    content: doc(paragraph()),
  },
  {
    id: "meeting",
    name: "Meeting notes",
    title: "Meeting notes",
    description: "Agenda, notes, and action items.",
    iconName: "meeting",
    content: doc(
      heading(1, "Meeting Notes"),
      paragraph("Date: "),
      paragraph("Attendees: "),
      heading(2, "Agenda"),
      bulletList(["Topic one", "Topic two"]),
      heading(2, "Notes"),
      paragraph(),
      heading(2, "Action items"),
      taskList(["Follow up on..."]),
    ),
  },
  {
    id: "project",
    name: "Project brief",
    title: "Project brief",
    description: "Overview, goals, and timeline.",
    iconName: "project",
    content: doc(
      heading(1, "Project Brief"),
      heading(2, "Overview"),
      paragraph(),
      heading(2, "Goals"),
      bulletList(["Goal one"]),
      heading(2, "Timeline"),
      paragraph(),
      heading(2, "Stakeholders"),
      bulletList(["Name — role"]),
    ),
  },
  {
    id: "journal",
    name: "Journal entry",
    title: "Journal entry",
    description: "A blank page with a prompt to start writing.",
    iconName: "journal",
    content: doc(
      heading(1, new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })),
      paragraph("Today I..."),
    ),
  },
];
