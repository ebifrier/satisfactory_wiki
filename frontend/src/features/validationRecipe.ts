import { TRecipe, TRecipeItem, RecipeUtil } from "@/types";

export type TErrorState = {
  errors: string[];
};

//
// 各レシピの原料を調べ、もし生産されないものであればエラーとします。
//
export const validateRecipes = (
  recipes: TRecipe[],
  ingredients: string[]
): TErrorState[] => {
  function validateIngredient(ing: TRecipeItem): string | undefined {
    if (ingredients.includes(ing.itemId)) {
      return;
    }

    for (const r of recipes) {
      if (RecipeUtil.findProduct(r, ing.itemId) != null) {
        return;
      }
    }

    return `${ing.item?.name}を生産するレシピがありません。`;
  }

  function* validateRecipe(recipe: TRecipe): Generator<string> {
    for (const ing of recipe.ingredients) {
      const error = validateIngredient(ing);
      if (error != null) {
        yield error;
      }
    }
  }

  return recipes.map((r) => ({ errors: [...validateRecipe(r)] }));
};
