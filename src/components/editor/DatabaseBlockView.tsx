import { useMemo, useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_DB_DATA, type DbColumn, type DbColumnType, type DbData, type DbRow } from "@/lib/editor/database-block";

const TYPE_LABELS: Record<DbColumnType, string> = {
  text: "Text",
  number: "Number",
  select: "Select",
  checkbox: "Checkbox",
  date: "Date",
};

function newColumn(name: string, type: DbColumnType): DbColumn {
  return { id: crypto.randomUUID(), name, type, options: type === "select" ? ["Option 1"] : undefined };
}

function newRow(columns: DbColumn[]): DbRow {
  const cells: DbRow["cells"] = {};
  for (const col of columns) cells[col.id] = col.type === "checkbox" ? false : null;
  return { id: crypto.randomUUID(), cells };
}

export function DatabaseBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const data: DbData = node.attrs.data ?? DEFAULT_DB_DATA;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ colId: string; dir: "asc" | "desc" } | null>(null);

  const set = (next: DbData) => updateAttributes({ data: next });

  const addColumn = () => set({ ...data, columns: [...data.columns, newColumn("New column", "text")] });
  const renameColumn = (id: string, name: string) =>
    set({ ...data, columns: data.columns.map((c) => (c.id === id ? { ...c, name } : c)) });
  const setColumnType = (id: string, type: DbColumnType) =>
    set({
      ...data,
      columns: data.columns.map((c) => (c.id === id ? { ...c, type, options: type === "select" ? c.options ?? ["Option 1"] : undefined } : c)),
    });
  const deleteColumn = (id: string) =>
    set({
      columns: data.columns.filter((c) => c.id !== id),
      rows: data.rows.map((r) => {
        const { [id]: _removed, ...rest } = r.cells;
        return { ...r, cells: rest };
      }),
    });

  const addRow = () => set({ ...data, rows: [...data.rows, newRow(data.columns)] });
  const deleteRow = (id: string) => set({ ...data, rows: data.rows.filter((r) => r.id !== id) });
  const setCell = (rowId: string, colId: string, value: string | number | boolean | null) =>
    set({ ...data, rows: data.rows.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: value } } : r)) });

  const toggleSort = (colId: string) =>
    setSort((prev) =>
      prev?.colId === colId ? (prev.dir === "asc" ? { colId, dir: "desc" } : null) : { colId, dir: "asc" },
    );

  const visibleRows = useMemo(() => {
    let rows = data.rows;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((r) => Object.values(r.cells).some((v) => String(v ?? "").toLowerCase().includes(q)));
    }
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const av = a.cells[sort.colId];
        const bv = b.cells[sort.colId];
        const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data.rows, query, sort]);

  return (
    <NodeViewWrapper data-type="database-block" className="my-2 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2/40 px-2.5 py-2">
        <Search size={13} className="shrink-0 text-faint" />
        <input
          contentEditable={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter rows…"
          className="min-w-0 flex-1 border-none bg-transparent text-xs text-ink outline-none placeholder:text-faint"
        />
        <button
          type="button"
          contentEditable={false}
          onClick={addColumn}
          className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-surface hover:text-ink"
        >
          <Plus size={12} /> Column
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {data.columns.map((col) => (
                <th key={col.id} className="border-b border-line px-2 py-1.5 text-left align-top">
                  <div className="mb-1 flex items-center gap-1">
                    <input
                      contentEditable={false}
                      value={col.name}
                      onChange={(e) => renameColumn(col.id, e.target.value)}
                      className="min-w-0 flex-1 border-none bg-transparent text-xs font-semibold text-ink outline-none"
                    />
                    <button
                      type="button"
                      contentEditable={false}
                      onClick={() => toggleSort(col.id)}
                      className="shrink-0 text-faint hover:text-ink"
                    >
                      {sort?.colId === col.id ? (
                        sort.dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                      ) : (
                        <ArrowUpDown size={11} />
                      )}
                    </button>
                    <button
                      type="button"
                      contentEditable={false}
                      onClick={() => deleteColumn(col.id)}
                      className="shrink-0 text-faint hover:text-danger"
                    >
                      <X size={11} />
                    </button>
                  </div>
                  <select
                    contentEditable={false}
                    value={col.type}
                    onChange={(e) => setColumnType(col.id, e.target.value as DbColumnType)}
                    className="w-full rounded border border-line bg-surface px-1 py-0.5 text-[10px] text-faint"
                  >
                    {(Object.keys(TYPE_LABELS) as DbColumnType[]).map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </th>
              ))}
              <th className="w-6 border-b border-line" />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="group">
                {data.columns.map((col) => (
                  <td key={col.id} className="border-b border-line px-2 py-1 align-top">
                    <Cell column={col} value={row.cells[col.id] ?? null} onChange={(v) => setCell(row.id, col.id, v)} />
                  </td>
                ))}
                <td className="border-b border-line px-1 py-1 text-center">
                  <button
                    type="button"
                    contentEditable={false}
                    onClick={() => deleteRow(row.id)}
                    className="hidden text-faint hover:text-danger group-hover:inline-flex"
                  >
                    <Trash2 size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        contentEditable={false}
        onClick={addRow}
        className="flex w-full items-center gap-1.5 px-2.5 py-2 text-left text-xs text-faint hover:bg-surface-2 hover:text-ink"
      >
        <Plus size={12} /> New row
      </button>
    </NodeViewWrapper>
  );
}

function Cell({
  column,
  value,
  onChange,
}: {
  column: DbColumn;
  value: string | number | boolean | null;
  onChange: (v: string | number | boolean | null) => void;
}) {
  if (column.type === "checkbox") {
    return (
      <input
        contentEditable={false}
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent"
      />
    );
  }
  if (column.type === "select") {
    return (
      <select
        contentEditable={false}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={cn("w-full rounded border-none bg-transparent text-xs text-ink outline-none")}
      >
        <option value="" />
        {(column.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (column.type === "number") {
    return (
      <input
        contentEditable={false}
        type="number"
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full border-none bg-transparent text-xs text-ink outline-none"
      />
    );
  }
  if (column.type === "date") {
    return (
      <input
        contentEditable={false}
        type="date"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full border-none bg-transparent text-xs text-ink outline-none"
      />
    );
  }
  return (
    <input
      contentEditable={false}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-none bg-transparent text-xs text-ink outline-none"
    />
  );
}
