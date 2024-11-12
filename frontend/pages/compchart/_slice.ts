import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TRecipe } from "@/index";

export type TRecipeSelection = {
  name: string;
  recipes: TRecipe[];
};

export type TProductAmount = {
  itemId?: string;
  amount: number;
};

export interface CompChartState {
  recipeSels: TRecipeSelection[];
  productAmounts: TProductAmount[];
}

const makeDefualtRecipeSel = () => ({ name: "", recipes: [] });
const makeDefualtTProductAmount = () => ({ amount: 100 });

const initialState: CompChartState = {
  recipeSels: [makeDefualtRecipeSel()],
  productAmounts: [makeDefualtTProductAmount()],
};

export const COMPCHART_SLICE_NAME = "compchart";

//
//
//
const compChartSlice = createSlice({
  name: COMPCHART_SLICE_NAME,
  initialState,
  reducers: {
    setRecipeSels(state, { payload }: PayloadAction<TRecipeSelection[]>) {
      state.recipeSels = payload;
    },

    addRecipeSel(
      { recipeSels },
      {
        payload,
      }: PayloadAction<{ index: number; recipeSel?: TRecipeSelection }>
    ) {
      const { index, recipeSel } = payload;
      if (index < 0 || index > recipeSels.length) {
        return;
      }

      recipeSels.splice(index, 0, recipeSel ?? makeDefualtRecipeSel());
    },

    updateRecipeSel(
      { recipeSels },
      { payload }: PayloadAction<{ index: number; recipeSel: TRecipeSelection }>
    ) {
      const { index, recipeSel } = payload;
      if (index < 0 || index >= recipeSels.length) {
        return;
      }

      recipeSels[index] = recipeSel;
    },

    deleteRecipeSel(
      { recipeSels },
      { payload }: PayloadAction<{ index: number }>
    ) {
      const { index } = payload;
      if (index < 0 || index >= recipeSels.length) {
        return;
      }

      recipeSels.splice(index, 1);
    },

    addRecipe(
      { recipeSels },
      { payload }: PayloadAction<{ index: number; recipe: TRecipe }>
    ) {
      const { index, recipe } = payload;
      if (index < 0 || index >= recipeSels.length) {
        return;
      }

      const { recipes } = recipeSels[index];
      if (recipes.find((r) => r.id === recipe.id) == null) {
        recipes.push({ ...recipe });
      }
    },

    deleteRecipe(
      { recipeSels },
      { payload }: PayloadAction<{ index: number; recipe: TRecipe }>
    ) {
      const { index, recipe } = payload;
      if (index < 0 || index >= recipeSels.length) {
        return;
      }

      const { recipes } = recipeSels[index];
      const recipeIndex = recipes.findIndex((r) => r.id === recipe.id);
      if (recipeIndex >= 0) {
        recipes.splice(recipeIndex, 1);
      }
    },

    addProductAmount(
      { productAmounts },
      { payload }: PayloadAction<TProductAmount | undefined>
    ) {
      productAmounts.push(payload ?? makeDefualtTProductAmount());
    },

    setProductAmount(
      { productAmounts },
      { payload }: PayloadAction<{ index: number; value: TProductAmount }>
    ) {
      const { index, value } = payload;
      if (index < 0 || index >= productAmounts.length) {
        return;
      }

      productAmounts[index] = value;
    },

    deleteProductAmount(
      { productAmounts },
      { payload }: PayloadAction<{ index: number }>
    ) {
      const { index } = payload;
      if (index < 0 || index >= productAmounts.length) {
        return;
      }

      productAmounts.splice(index, 1);
    },
  },
});

export const { actions } = compChartSlice;
export default compChartSlice;