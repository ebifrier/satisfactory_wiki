import _ from "lodash";
import {
  fetcher,
  TItem,
  TRecipe,
  BuildingUtil,
  TableUtil,
  TTableData,
  TTableColumn,
} from "@/index";

export type TRecipeSelection = {
  name: string;
  recipes: TRecipe[];
};

export type TProductAmount = {
  itemId?: string;
  amount: number;
};

type StringToValueDic = { [key: string]: number };

type TCompChart = {
  recipes: StringToValueDic;
  ingredients: string[];
  buildings: StringToValueDic;
  net: StringToValueDic;
  consume: number;
  power: number;
  name: string;
};

export class RecipeSelectionUtil {
  static addRecipe = (
    recipeSel: TRecipeSelection,
    recipe: TRecipe
  ): TRecipeSelection => {
    const { recipes } = recipeSel;
    return recipes.find((r) => r.id === recipe.id)
      ? recipeSel
      : { ...recipeSel, recipes: [...recipes, { ...recipe }] };
  };

  static removeRecipe = (
    recipeSel: TRecipeSelection,
    recipe: TRecipe
  ): TRecipeSelection => {
    const { recipes } = recipeSel;
    return { ...recipeSel, recipes: recipes.filter((r) => r !== recipe) };
  };

  static updateSel = (
    recipeSels: TRecipeSelection[],
    index: number,
    recipeSel?: TRecipeSelection,
    insert?: boolean
  ): TRecipeSelection[] =>
    recipeSel == null
      ? recipeSels.toSpliced(index, 1)
      : insert === true
      ? recipeSels.toSpliced(index, 0, recipeSel)
      : recipeSels.map((rs, i) => (i == index ? recipeSel : rs));
}

export class ProductAmountUtil {
  static add = (
    productAmounts: TProductAmount[],
    value: TProductAmount
  ): TProductAmount[] => {
    return productAmounts.concat({ ...value });
  };

  static remove = (
    productAmounts: TProductAmount[],
    index: number
  ): TProductAmount[] => {
    return productAmounts.toSpliced(index, 1);
  };
}

const filterIngredients = (charts: TCompChart[]) => {
  const ingredients = [...charts[0].ingredients];

  for (let i = 0; i < ingredients.length; ) {
    const ingId = ingredients[i];
    const entry = charts.find(
      (chart) => ingId in chart.net && chart.net[ingId] < 0
    );
    if (entry == null) {
      ingredients.splice(i, 1);
    } else {
      ++i;
    }
  }

  return ingredients;
};

const getBuildingsAreaSize = (buildings: StringToValueDic): number => {
  return _.sum(
    Object.entries(buildings).map(
      ([id, count]) => BuildingUtil.getAreaSize(id) * count
    )
  );
};

export const createCompChartData = (
  charts: TCompChart[],
  items: TItem[]
): TTableData => {
  if (!charts || charts.length === 0) {
    return { rows: [] };
  }

  const ingredients = filterIngredients(charts);
  const ingColumns = ingredients.map(() => TableUtil.newColumn(">"));
  if (ingColumns.length === 0) {
    return { rows: [] };
  }
  ingColumns.pop();

  const rows = [
    TableUtil.newRow(
      [
        TableUtil.newColumn(""),
        ...ingColumns,
        TableUtil.newColumn("", { attr: { textAlign: "center" } }),
        TableUtil.newColumn(">"),
        TableUtil.newColumn("", { attr: { textAlign: "center" } }),
      ],
      TableUtil.ROW_FORMATTING
    ),
    TableUtil.newRow(
      [
        TableUtil.newColumn("レシピ"),
        ...ingColumns,
        TableUtil.newColumn("必要原料 (個/分)"),
        TableUtil.newColumn("消費電力&br;(MW)"),
        TableUtil.newColumn("床面積&br;(土台換算)"),
      ],
      TableUtil.ROW_HEADER
    ),
    TableUtil.newRow(
      [
        TableUtil.newColumn("~"),
        ...ingredients
          .map((ingId) => items.find((item) => item.id === ingId))
          .map((item) => TableUtil.newColumn(item?.name ?? "")),
        TableUtil.newColumn("~"),
        TableUtil.newColumn("~"),
        TableUtil.newColumn("~"),
      ],
      TableUtil.ROW_HEADER
    ),
    TableUtil.newRow(
      [
        TableUtil.newColumn("", {
          attr: { textAlign: "left", width: "180px" },
        }),
        ...ingColumns,
        TableUtil.newColumn("", {
          attr: { textAlign: "right", width: "60px" },
        }),
        TableUtil.newColumn(">"),
        TableUtil.newColumn("", { attr: { textAlign: "right" } }),
      ],
      TableUtil.ROW_FORMATTING
    ),
  ];

  for (const { name, buildings, consume, net } of charts) {
    const columns: TTableColumn[] = [TableUtil.newColumn(name)];
    const toFixed = (value: number) => {
      return value.toFixed(0);
      //const text2 = value.toFixed(2);
      //return text2 === `${text0}.00` ? text0 : text2;
    };

    for (const ingId of ingredients) {
      const tag = ingId in net && net[ingId] < 0 ? toFixed(-net[ingId]) : "-";
      columns.push(TableUtil.newColumn(tag));
    }

    columns.push(TableUtil.newColumn(consume.toFixed(0)));
    columns.push(
      TableUtil.newColumn(getBuildingsAreaSize(buildings).toFixed(0))
    );
    rows.push(TableUtil.newRow(columns));
  }

  return { rows };
};

export const executeCompChart = async (
  recipeSels: TRecipeSelection[],
  productAmounts: TProductAmount[]
): Promise<TCompChart[]> => {
  const productIds = productAmounts
    .filter(({ itemId }) => itemId != null)
    .map(({ itemId, amount }) => `${itemId}:${amount}`)
    .join(",");

  const ingredients = ["Iron_Ingot"].join(",");

  const charts: TCompChart[] = [];
  for (const recipeSel of recipeSels) {
    const recipeIds = recipeSel.recipes.map((r) => r.id).join(",");
    const chart: TCompChart = await fetcher(
      `/api/v1/planner?recipes=${recipeIds}&products=${productIds}&ingredients=${ingredients}`
    );
    charts.push({ ...chart, name: recipeSel.name });
  }

  console.log(charts);
  return charts;
};
