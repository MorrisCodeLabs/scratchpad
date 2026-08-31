import { useMemo, useState } from "react";
import { isWithinInterval, parseISO } from "date-fns";
import { Plus, Search, CheckSquare, X, Archive, Trash2, Tag as TagIcon, SlidersHorizontal, Sparkles } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { docToSearchText } from "@/lib/text-stats";
import { semanticScore } from "@/lib/semantic-search";
import { NewNoteMenu } from "@/components/NewNoteMenu";
import { NoteCard } from "@/components/views/NoteCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AdvancedSearchDialog, EMPTY_FILTERS, type AdvancedFilters } from "@/components/views/AdvancedSearchDialog";
import { cn } from "@/lib/cn";

type SortBy = "updated" | "created" | "viewed" | "title";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "updated", label: "Last updated" },
  { value: "viewed", label: "Recently viewed" },
  { value: "created", label: "Date created" },
  { value: "title", label: "Title A–Z" },
];

export function AllNotesView() {
  const { notes, navigate } = useWorkspaceContext();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [semantic, setSemantic] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(EMPTY_FILTERS);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes.notes) for (const t of n.tags ?? []) set.add(t);
    return [...set].sort();
  }, [notes.notes]);

  const filtersActive =
    filters.statuses.length > 0 || filters.pinnedOnly || filters.favoriteOnly || filters.dateFrom || filters.dateTo;

  const filtered = useMemo(() => {
    const q = query.trim();
    const scored = notes.notes
      .map((n) => {
        const haystack = `${n.title}\n${docToSearchText(n.content)}`;
        let score = 1;
        if (q) {
          score = semantic
            ? Math.max(semanticScore(q, n.title), semanticScore(q, haystack))
            : haystack.toLowerCase().includes(q.toLowerCase())
              ? 1
              : 0;
        }
        return { note: n, score };
      })
      .filter(({ note: n, score }) => {
        if (q && score <= 0) return false;
        // Selecting a parent tag ("Work") also matches its nested children ("Work/ProjectX").
        if (activeTag && !n.tags?.some((t) => t === activeTag || t.startsWith(`${activeTag}/`))) return false;
        if (filters.statuses.length > 0 && !filters.statuses.includes(n.status)) return false;
        if (filters.pinnedOnly && !n.is_pinned) return false;
        if (filters.favoriteOnly && !n.is_favorite) return false;
        if (filters.dateFrom || filters.dateTo) {
          const created = new Date(n.created_at);
          const from = filters.dateFrom ? parseISO(filters.dateFrom) : new Date(0);
          const to = filters.dateTo ? parseISO(`${filters.dateTo}T23:59:59`) : new Date(8640000000000000);
          if (!isWithinInterval(created, { start: from, end: to })) return false;
        }
        return true;
      });

    if (q && semantic) {
      scored.sort((a, b) => b.score - a.score);
      return scored.map((s) => s.note);
    }

    const sorted = scored.map((s) => s.note);
    switch (sortBy) {
      case "created":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "viewed":
        sorted.sort((a, b) => new Date(b.last_viewed_at ?? 0).getTime() - new Date(a.last_viewed_at ?? 0).getTime());
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }
    return sorted;
  }, [notes.notes, query, activeTag, sortBy, semantic, filters]);

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelected(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkArchive = async () => {
    await Promise.all([...selected].map((id) => notes.archiveNote(id)));
    setSelected(new Set());
  };

  const bulkTrash = async () => {
    await Promise.all([...selected].map((id) => notes.trashNote(id)));
    setSelected(new Set());
  };

  return (
    <div className="mx-auto h-full max-w-6xl overflow-y-auto px-4 py-6 sm:px-10 sm:py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[1.7rem] font-bold text-ink">All notes</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectMode}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
              selectMode ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-muted hover:bg-surface-2",
            )}
          >
            <CheckSquare size={15} /> Select
          </button>
          <NewNoteMenu>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus size={15} /> New note
            </button>
          </NewNoteMenu>
        </div>
      </div>

      {selectMode && selected.size > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-lg bg-accent-soft px-4 py-2.5 text-[13px] text-accent-ink">
          <span className="font-medium">{selected.size} selected</span>
          <button type="button" onClick={bulkArchive} className="flex items-center gap-1.5 hover:underline">
            <Archive size={13} /> Archive
          </button>
          <button type="button" onClick={bulkTrash} className="flex items-center gap-1.5 hover:underline">
            <Trash2 size={13} /> Trash
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto flex items-center gap-1.5 hover:underline">
            <X size={13} /> Clear
          </button>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-2.5">
          <Search size={15} className="text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this workspace — including text inside PDFs and images…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        <button
          type="button"
          title="Semantic search: rank by relevance instead of exact matches"
          onClick={() => setSemantic((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
            semantic ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-muted hover:bg-surface-2",
          )}
        >
          <Sparkles size={15} /> Semantic
        </button>
        <button
          type="button"
          title="Advanced filters"
          onClick={() => setAdvancedOpen(true)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
            filtersActive ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-muted hover:bg-surface-2",
          )}
        >
          <SlidersHorizontal size={15} />
        </button>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-44 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          <TagIcon size={13} className="text-faint" />
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                activeTag === tag ? "bg-accent text-white" : "bg-surface-2 text-muted hover:bg-line",
              )}
            >
              {tag.replace(/\//g, " › ")}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-faint">
          {query || activeTag || filtersActive ? "No notes match your filters." : "No notes yet — create your first one."}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={() => navigate({ name: "note", id: note.id })}
              selectable={selectMode}
              selected={selected.has(note.id)}
              onToggleSelect={() => toggleSelected(note.id)}
            />
          ))}
        </div>
      )}

      <AdvancedSearchDialog open={advancedOpen} onOpenChange={setAdvancedOpen} filters={filters} onChange={setFilters} />
    </div>
  );
}
