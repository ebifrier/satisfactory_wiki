import _ from "lodash";
import {
  fetcher,
  TItem,
  BuildingUtil,
  TableUtil,
  TTableData,
  TTableColumn,
} from "@/index";
import { TRecipeSelection, TProductAmount } from "../features/compchartSlice";

type StringToValueDic = { [key: string]: number };

type APICompChartResult = {
  recipes: StringToValueDic;
  buildings: StringToValueDic;
  net: StringToValueDic;
  consume: number;
  power: number;
  name: string;
};

const getBuildingsAreaSize = (buildings: StringToValueDic): number => {
  return _.sum(
    Object.entries(buildings).map(
      ([id, count]) => BuildingUtil.getAreaSize(id) * count
    )
  );
};

const convertItemName = (name?: string): string => {
  if (name == null) {
    return "";
  }

  switch (name) {
    case "未加工石英":
      return "未加工&br;石英";
    case "カテリウム鉱石":
      return "カテリウム&br;鉱石";
    case "ボーキサイト":
      return "ボーキ&br;サイト";
  }

  const index = name.indexOf("のインゴット");
  if (index >= 0) {
    return `${name.substring(0, index)}の&br;インゴット`;
  }

  return name;
};

export const createCompChartData = (
  charts: APICompChartResult[],
  ingredientIds: string[],
  items: TItem[]
): TTableData => {
  if (!charts || charts.length === 0) {
    return { rows: [] };
  }

  const ingredients = ingredientIds.map((ingId) =>
    items.find((item) => item.id === ingId)
  );

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
        ...ingredients.map((item) =>
          TableUtil.newColumn(convertItemName(item?.name))
        ),
        TableUtil.newColumn("~"),
        TableUtil.newColumn("~"),
      ],
      TableUtil.ROW_HEADER
    ),
    TableUtil.newRow(
      [
        TableUtil.newColumn("", {
          attr: { textAlign: "left", width: 180 },
        }),
        ...ingColumns,
        TableUtil.newColumn("", {
          attr: { textAlign: "right", width: 60 },
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
    };

    for (const ingId of ingredientIds) {
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
  productAmounts: TProductAmount[],
  ingredients: string[]
): Promise<APICompChartResult[]> => {
  const productIds = productAmounts
    .filter(({ itemId }) => itemId != null)
    .map(({ itemId, amount }) => `${itemId}:${amount}`)
    .join(",");
  const ingredientIds = ingredients.join(",");

  const charts = [];
  for (const recipeSel of recipeSels) {
    const recipeIds = recipeSel.recipes.map((r) => r.id).join(",");
    const param = new URLSearchParams();
    param.append("recipes", recipeIds);
    param.append("products", productIds);
    param.append("ingredients", ingredientIds);

    const chart = await fetcher<APICompChartResult>(
      `/api/v1/planner?${param.toString()}`
    );
    charts.push({ ...chart, name: recipeSel.name });
  }

  return charts;
};
