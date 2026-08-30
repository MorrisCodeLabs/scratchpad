import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { BookMarked, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIsPro } from "@/lib/use-plan";
import type { NoteSource } from "@/lib/types";
import type { NoteSourceInput } from "@/lib/data/use-note-sources";

export function CitationsPanel({
  editor,
  sources,
  onAddSource,
  onDeleteSource,
}: {
  editor: Editor | null;
  sources: NoteSource[];
  onAddSource: (input: NoteSourceInput) => void;
  onDeleteSource: (id: string) => void;
}) {
  const isPro = useIsPro();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [url, setUrl] = useState("");

  const save = () => {
    if (!title.trim()) return;
    onAddSource({
      title: title.trim(),
      author: author.trim() || null,
      year: year ? Number(year) : null,
      url: url.trim() || null,
      source_type: "website",
    });
    setTitle("");
    setAuthor("");
    setYear("");
    setUrl("");
  };

  const insertCitation = (sourceId: string) => {
    editor?.chain().focus().insertContent({ type: "citation", attrs: { sourceId } }).insertContent(" ").run();
  };

  if (!isPro) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Citations"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-faint hover:bg-surface-2"
        >
          <BookMarked size={13} />
          Citations
          {sources.length > 0 && <span className="tabular-nums">({sources.length})</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Sources</p>
        <div className="mb-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
          {sources.length === 0 ? (
            <p className="text-xs text-faint">No sources yet.</p>
          ) : (
            sources.map((s) => (
              <div key={s.id} className="group flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 py-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => insertCitation(s.id)}
                  title="Insert citation at cursor"
                  className="min-w-0 flex-1 truncate text-left text-ink hover:underline"
                >
                  {s.title}
                  {s.author && ` — ${s.author}`}
                  {s.year && ` (${s.year})`}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSource(s.id)}
                  className="hidden shrink-0 text-faint hover:text-danger group-hover:block"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Add a source</p>
        <div className="flex flex-col gap-1.5">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-8 text-xs" />
          <div className="flex gap-1.5">
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="h-8 text-xs" />
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              placeholder="Year"
              className="h-8 w-20 text-xs"
            />
          </div>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (optional)" className="h-8 text-xs" />
          <Button size="sm" onClick={save} disabled={!title.trim()}>
            <Plus size={12} /> Add source
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
