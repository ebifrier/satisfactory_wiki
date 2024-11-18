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

export interface TCompChartState {
  id: string;
  name: string;
  recipeSels: TRecipeSelection[];
  productAmounts: TProductAmount[];
  ingredients: string[];
}

export type TCompChartListState = {
  charts: TCompChartState[];
};

const makeDefualtRecipeSel = (): TRecipeSelection => ({
  name: "",
  recipes: [],
});

const makeDefualtProductAmount = (): TProductAmount => ({
  amount: 100,
});

const makeDefaultChart = (): TCompChartState => ({
  id: getUniqueStr(),
  name: "新規レシピ比較表",
  recipeSels: [makeDefualtRecipeSel()],
  productAmounts: [makeDefualtProductAmount()],
  ingredients: [""],
});

const getUniqueStr = (strong?: number): string => {
  return (
    new Date().getTime().toString(16) +
    Math.floor((strong ?? 1000) * Math.random()).toString(16)
  );
};

const initialState: TCompChartListState = {
  charts: [makeDefaultChart()],
};

//
//
//
const compChartSlice = createSlice({
  name: "compchart",
  initialState,
  reducers: {
    addChart(
      { charts },
      { payload: { chart } }: PayloadAction<{ chart?: TCompChartState }>
    ) {
      charts.push(chart ?? makeDefaultChart());
    },

    deleteChart(
      { charts },
      { payload: { chartId } }: PayloadAction<{ chartId: string }>
    ) {
      const index = charts.findIndex(({ id }) => id === chartId);
      if (index < 0) {
        return;
      }

      charts.splice(index, 1);
    },

    setChart({ charts }, { payload: chart }: PayloadAction<TCompChartState>) {
      const existedChart = charts.find(({ id }) => id === chart.id);
      if (existedChart == null) {
        return;
      }

      Object.assign(existedChart, chart);
    },

    addRecipeSel(
      { charts },
      {
        payload: { chartId, recipeSel },
      }: PayloadAction<{
        chartId: string;
        recipeSel?: TRecipeSelection;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      chart.recipeSels.push(recipeSel ?? makeDefualtRecipeSel());
    },

    updateRecipeSel(
      { charts },
      {
        payload: { chartId, selIndex, recipeSel },
      }: PayloadAction<{
        chartId: string;
        selIndex: number;
        recipeSel: TRecipeSelection;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (selIndex < 0 || selIndex >= chart.recipeSels.length) {
        return;
      }

      chart.recipeSels[selIndex] = recipeSel;
    },

    swapRecipeSel(
      { charts },
      {
        payload: { chartId, from, to },
      }: PayloadAction<{
        chartId: string;
        from: number;
        to: number;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (from < 0 || from >= chart.recipeSels.length) {
        return;
      }

      if (to < 0 || to >= chart.recipeSels.length) {
        return;
      }

      const tmp = chart.recipeSels[from];
      chart.recipeSels[from] = chart.recipeSels[to];
      chart.recipeSels[to] = tmp;
    },

    deleteRecipeSel(
      { charts },
      {
        payload: { chartId, selIndex },
      }: PayloadAction<{ chartId: string; selIndex: number }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (selIndex < 0 || selIndex >= chart.recipeSels.length) {
        return;
      }

      chart.recipeSels.splice(selIndex, 1);
    },

    addRecipe(
      { charts },
      {
        payload: { chartId, selIndex, recipe },
      }: PayloadAction<{ chartId: string; selIndex: number; recipe: TRecipe }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (selIndex < 0 || selIndex >= chart.recipeSels.length) {
        return;
      }

      const { recipes } = chart.recipeSels[selIndex];
      if (recipes.find((r) => r.id === recipe.id) == null) {
        recipes.push({ ...recipe });
      }
    },

    deleteRecipe(
      { charts },
      {
        payload: { chartId, selIndex, recipe },
      }: PayloadAction<{ chartId: string; selIndex: number; recipe: TRecipe }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (selIndex < 0 || selIndex >= chart.recipeSels.length) {
        return;
      }

      const { recipes } = chart.recipeSels[selIndex];
      const recipeIndex = recipes.findIndex((r) => r.id === recipe.id);
      if (recipeIndex >= 0) {
        recipes.splice(recipeIndex, 1);
      }
    },

    addProductAmount(
      { charts },
      {
        payload: { chartId, productAmounts },
      }: PayloadAction<{
        chartId: string;
        productAmounts?: TProductAmount;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      chart.productAmounts.push(productAmounts ?? makeDefualtProductAmount());
    },

    updateProductAmount(
      { charts },
      {
        payload: { chartId, index, value },
      }: PayloadAction<{
        chartId: string;
        index: number;
        value: TProductAmount;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (index < 0 || index >= chart.productAmounts.length) {
        return;
      }

      chart.productAmounts[index] = value;
    },

    deleteProductAmount(
      { charts },
      {
        payload: { chartId, index },
      }: PayloadAction<{ chartId: string; index: number }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (index < 0 || index >= chart.productAmounts.length) {
        return;
      }

      chart.productAmounts.splice(index, 1);
    },

    addIngredient(
      { charts },
      {
        payload: { chartId, ingredient },
      }: PayloadAction<{
        chartId: string;
        ingredient?: string;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      chart.ingredients.push(ingredient ?? "");
    },

    setIngredients(
      { charts },
      {
        payload: { chartId, ingredients },
      }: PayloadAction<{
        chartId: string;
        ingredients: string[];
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      chart.ingredients = ingredients;
    },

    swapIngredient(
      { charts },
      {
        payload: { chartId, from, to },
      }: PayloadAction<{
        chartId: string;
        from: number;
        to: number;
      }>
    ) {
      const chart = charts.find(({ id }) => id === chartId);
      if (chart == null) {
        return;
      }

      if (from < 0 || from >= chart.ingredients.length) {
        return;
      }

      if (to < 0 || to >= chart.ingredients.length) {
        return;
      }

      const tmp = chart.ingredients[from];
      chart.ingredients[from] = chart.ingredients[to];
      chart.ingredients[to] = tmp;
    },
  },
});

export const { actions } = compChartSlice;
export default compChartSlice;
