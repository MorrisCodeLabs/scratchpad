import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { RecipeBlockView } from "@/components/editor/RecipeBlockView";

export interface RecipeIngredient {
  qty: number;
  unit: string;
  name: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    recipeBlock: {
      setRecipeBlock: () => ReturnType;
    };
  }
}

// Ingredient quantities are stored relative to `baseServings`; the view
// scales them live against `currentServings` rather than mutating the
// stored amounts, so the "real" recipe (as written) is never lost to
// repeated rounding as someone scales up and back down.
export const RecipeBlock = Node.create({
  name: "recipeBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      title: { default: "Recipe" },
      baseServings: {
        default: 4,
        parseHTML: (element) => Number(element.getAttribute("data-base-servings") ?? 4),
        renderHTML: (attributes) => ({ "data-base-servings": attributes.baseServings }),
      },
      currentServings: {
        default: 4,
        parseHTML: (element) => Number(element.getAttribute("data-current-servings") ?? 4),
        renderHTML: (attributes) => ({ "data-current-servings": attributes.currentServings }),
      },
      ingredients: {
        default: [] as RecipeIngredient[],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-ingredients");
          if (!raw) return [];
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({ "data-ingredients": JSON.stringify(attributes.ingredients ?? []) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="recipe-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "recipe-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RecipeBlockView);
  },

  addCommands() {
    return {
      setRecipeBlock:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: {
              title: "Recipe",
              baseServings: 4,
              currentServings: 4,
              ingredients: [
                { qty: 2, unit: "cups", name: "flour" },
                { qty: 1, unit: "tsp", name: "salt" },
              ],
            },
          }),
    };
  },
});
