import _ from "lodash";
import {
  fetcher,
  TItem,
  BuildingUtil,
  TableUtil,
  TTableData,
  TTableColumn,
  TTextTag,
} from "@/index";
import { TRecipeSelection, TProductAmount } from "../features/compchartSlice";

type StringToValueDic = { [key: string]: number };

type APICompChart = {
  recipes: StringToValueDic;
  buildings: StringToValueDic;
  net: StringToValueDic;
  consume: number;
  power: number;
  name: string;
};

type APICompChartResult = {
  charts: APICompChart[];
  errors: string[];
};

const getBuildingsAreaSize = (buildings: StringToValueDic): number => {
  return _.sum(
    Object.entries(buildings).map(
      ([id, count]) => BuildingUtil.getAreaSize(id) * count
    )
  );
};

const convertItemName = (name?: string): string | TTextTag[] => {
  if (name == null) {
    return "";
  }

  switch (name) {
    case "未加工石英":
      return "未加工&br;石英";
    case "カテリウム鉱石":
      return [{ type: "text", content: "カテリウム&br;鉱石", size: 10 }];
    case "ボーキサイト":
      return "ボーキ&br;サイト";
  }

  const index = name.indexOf("のインゴット");
  if (index >= 0) {
    return [
      { type: "text", content: `${name.substring(0, index)}の&br;` },
      { type: "text", content: "インゴット", size: 10 },
    ];
  }

  return name;
};

const getFixedDigits = (values: number[], ndigits: number): number => {
  const comp = Math.pow(10, ndigits);
  return values.some((v) => v < comp) ? 1 : 0;
};

export const createCompChartData = (
  charts: APICompChart[],
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

  const consumDigits = getFixedDigits(
    charts.map((c) => c.consume),
    2
  );
  const areaDigits = getFixedDigits(
    charts.map((c) => getBuildingsAreaSize(c.buildings)),
    1
  );
  const ngidits = Math.max(consumDigits, areaDigits);

  for (const { name, buildings, consume, net } of charts) {
    const columns: TTableColumn[] = [TableUtil.newColumn(name)];
    const toCeil = (value: number, ndigits: number): string => {
      const base = Math.pow(10, ndigits);
      return (Math.ceil(value * base) / base).toFixed(ndigits);
    };
    const toFixed = (value: number, ndigits: number): string => {
      return value.toFixed(ndigits);
    };

    for (const ingId of ingredientIds) {
      const tag =
        ingId in net && net[ingId] < 0 ? toFixed(-net[ingId], 0) : "-";
      columns.push(TableUtil.newColumn(`${tag}`));
    }

    columns.push(TableUtil.newColumn(toFixed(consume, ngidits)));
    columns.push(
      TableUtil.newColumn(toCeil(getBuildingsAreaSize(buildings), ngidits))
    );
    rows.push(TableUtil.newRow(columns));
  }

  return { rows };
};

export const executeCompChart = async (
  recipeSels: TRecipeSelection[],
  productAmounts: TProductAmount[],
  ingredients: string[]
): Promise<APICompChartResult> => {
  const errors: string[] = [];

  if (ingredients.length === 0) {
    errors.push("原料が指定されていません。");
  }

  const filtered = productAmounts.filter(({ itemId }) => itemId != null);
  if (filtered.length === 0) {
    errors.push("生産物が指定されていません。");
  }

  if (errors.length > 0) {
    return { charts: [], errors };
  }

  const productIds = productAmounts
    .filter(({ itemId }) => itemId != null)
    .map(({ itemId, amount }) => `${itemId}:${amount}`)
    .join(",");
  const ingredientIds = ingredients.join(",");

  const charts: APICompChart[] = [];
  for (const [i, recipeSel] of recipeSels.entries()) {
    const recipeIds = recipeSel.recipes.map((r) => r.id).join(",");
    const param = new URLSearchParams();
    param.append("recipes", recipeIds);
    param.append("products", productIds);
    param.append("ingredients", ingredientIds);

    const chart = await fetcher<APICompChart>(
      `/api/v1/planner?${param.toString()}`
    );
    charts.push({ ...chart, name: recipeSel.name || `#${i + 1}` });
  }

  return { charts, errors };
};
