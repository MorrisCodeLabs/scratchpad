import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { RecipeIngredient } from "@/lib/editor/recipe-block";

function formatQty(n: number) {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toString();
}

export function RecipeBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const title: string = node.attrs.title;
  const baseServings: number = node.attrs.baseServings;
  const currentServings: number = node.attrs.currentServings;
  const ingredients: RecipeIngredient[] = node.attrs.ingredients ?? [];
  const [draft, setDraft] = useState({ qty: "", unit: "", name: "" });

  const scale = baseServings > 0 ? currentServings / baseServings : 1;

  const setServings = (next: number) => {
    updateAttributes({ currentServings: Math.max(1, next) });
  };

  const updateIngredient = (index: number, patch: Partial<RecipeIngredient>) => {
    const next = ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing));
    updateAttributes({ ingredients: next });
  };

  const removeIngredient = (index: number) => {
    updateAttributes({ ingredients: ingredients.filter((_, i) => i !== index) });
  };

  const addIngredient = () => {
    const qty = Number(draft.qty);
    if (!draft.name.trim() || !Number.isFinite(qty) || qty <= 0) return;
    updateAttributes({ ingredients: [...ingredients, { qty, unit: draft.unit.trim(), name: draft.name.trim() }] });
    setDraft({ qty: "", unit: "", name: "" });
  };

  return (
    <NodeViewWrapper data-type="recipe-block" className="my-2 rounded-lg border border-line bg-surface p-4">
      <input
        contentEditable={false}
        value={title}
        onChange={(e) => updateAttributes({ title: e.target.value })}
        placeholder="Recipe name"
        className="mb-3 w-full border-none bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-faint"
      />

      <div className="mb-3 flex items-center gap-2 text-[13px] text-muted">
        <span>Servings</span>
        <div className="flex items-center gap-1 rounded-md border border-line">
          <button
            type="button"
            onClick={() => setServings(currentServings - 1)}
            className="flex h-6 w-6 items-center justify-center text-faint hover:text-ink"
          >
            <Minus size={12} />
          </button>
          <span className="w-6 text-center tabular-nums text-ink">{currentServings}</span>
          <button
            type="button"
            onClick={() => setServings(currentServings + 1)}
            className="flex h-6 w-6 items-center justify-center text-faint hover:text-ink"
          >
            <Plus size={12} />
          </button>
        </div>
        {currentServings !== baseServings && (
          <button
            type="button"
            onClick={() => setServings(baseServings)}
            className="text-xs text-faint underline-offset-2 hover:text-ink hover:underline"
          >
            Reset to {baseServings}
          </button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-line">
        {ingredients.map((ing, i) => (
          <div key={i} className="group flex items-center gap-2 py-1.5 text-[13px]">
            <input
              contentEditable={false}
              value={formatQty(ing.qty * scale)}
              onChange={(e) => {
                const displayed = Number(e.target.value);
                if (!Number.isFinite(displayed)) return;
                updateIngredient(i, { qty: scale > 0 ? displayed / scale : displayed });
              }}
              className="w-14 shrink-0 rounded border border-transparent bg-transparent text-right tabular-nums text-ink outline-none hover:border-line focus:border-line"
            />
            <input
              contentEditable={false}
              value={ing.unit}
              onChange={(e) => updateIngredient(i, { unit: e.target.value })}
              className="w-14 shrink-0 rounded border border-transparent bg-transparent text-faint outline-none hover:border-line focus:border-line"
            />
            <input
              contentEditable={false}
              value={ing.name}
              onChange={(e) => updateIngredient(i, { name: e.target.value })}
              className="flex-1 rounded border border-transparent bg-transparent text-ink outline-none hover:border-line focus:border-line"
            />
            <button
              type="button"
              onClick={() => removeIngredient(i)}
              className="hidden h-5 w-5 shrink-0 items-center justify-center text-faint hover:text-danger group-hover:flex"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <input
          contentEditable={false}
          value={draft.qty}
          onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value.replace(/[^0-9.]/g, "") }))}
          placeholder="Qty"
          className="h-7 w-14 rounded-md border border-line bg-surface px-1.5 text-xs text-ink outline-none placeholder:text-faint"
        />
        <input
          contentEditable={false}
          value={draft.unit}
          onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))}
          placeholder="Unit"
          className="h-7 w-16 rounded-md border border-line bg-surface px-1.5 text-xs text-ink outline-none placeholder:text-faint"
        />
        <input
          contentEditable={false}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && addIngredient()}
          placeholder="Ingredient"
          className="h-7 flex-1 rounded-md border border-line bg-surface px-1.5 text-xs text-ink outline-none placeholder:text-faint"
        />
        <button
          type="button"
          onClick={addIngredient}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line text-faint hover:bg-surface-2 hover:text-ink"
        >
          <Plus size={13} />
        </button>
      </div>
    </NodeViewWrapper>
  );
}
