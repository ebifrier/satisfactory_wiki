import { CSSProperties } from "react";
import _ from "lodash";
import {
  TRecipe,
  TCondition,
  RecipeUtil,
  ItemUtil,
  ConditionUtil,
} from "./types";
import {
  TTableData,
  TTableRow,
  TTableColumn,
  TagUtil,
  TableUtil,
} from "./table";

//
// レシピをTableDataに変換します。
//
export const createRecipeData = (
  itemId: string,
  recipe: TRecipe
): TTableData => {
  const { alternate, linkAnchor, building, building2 } = recipe;
  const rows: TTableRow[] = [];

  // ページ編集用の目印
  const pre = ["//"];
  pre.push(`//	${!alternate ? "通常" : "HD解析"}`);
  if (!RecipeUtil.isByproduct(recipe, itemId)) {
    pre.push(`#aname(Recipe_${linkAnchor})`);
  } else {
    pre.push(`// #aname(Recipe_)`);
  }

  // ヘッダ行の書式設定
  {
    const background = RecipeUtil.bgColor(recipe, itemId);
    const columns: TTableColumn[] = [
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      {
        tags: [],
        attr: { background, textAlign: "left" },
      },
    ];
    if (building2 != null) {
      columns.push(TableUtil.newColumn(">"));
    }
    columns.push({
      tags: [],
      attr: { background, textAlign: "center" },
    });
    rows.push(TableUtil.newRow(columns, TableUtil.ROW_FORMATTING));
  }

  // レシピ名やマイルストーンなどのヘッダ行を表示
  {
    const cond = TagUtil.getConditionLink(recipe);
    const columns: TTableColumn[] = [
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      TableUtil.newColumn(">"),
      { tags: [`''${recipe.name}'' &br;`, ...cond] },
      { tags: [TagUtil.getBuildingLink(building)] },
    ];
    if (building2 != null) {
      columns.push(TableUtil.newColumn(TagUtil.getBuildingLink(building2)));
    }
    rows.push(TableUtil.newRow(columns, TableUtil.ROW_HEADER));
  }

  // テーブル中身の書式設定
  {
    const columns: TTableColumn[] = [
      { tags: [], attr: { width: 240, textAlign: "left" } },
      { tags: [], attr: { width: 40, textAlign: "right" } },
      {
        tags: [],
        attr: { width: 50, textAlign: "right", background: "khaki" },
      },
      { tags: [], attr: { width: 240, textAlign: "left" } },
      { tags: [], attr: { width: 40, textAlign: "right" } },
      {
        tags: [],
        attr: { width: 50, textAlign: "right", background: "palegreen" },
      },
    ];
    if (building2 != null) {
      columns.push(TableUtil.newColumn(">"));
    }
    columns.push({
      tags: [],
      attr: { width: 80, textAlign: "center" },
    });
    rows.push(TableUtil.newRow(columns, TableUtil.ROW_FORMATTING));
  }

  const { maxInputs, maxOutputs } = building;
  for (let i = 0; i < maxInputs; ++i) {
    const product =
      i % maxOutputs == 0 ? recipe.products[i / Math.max(1, maxOutputs)] : null;
    const ingredient = recipe.ingredients[i];
    const columns = [
      TableUtil.newColumn(
        ingredient?.item ? TagUtil.getSmallImageLink(ingredient.item) : "　-"
      ),
      TableUtil.newColumn(TagUtil.amountToStr(ingredient?.amount) ?? "-"),
      TableUtil.newColumn(TagUtil.minuteToStr(ingredient?.minute) ?? "-"),
      TableUtil.newColumn(
        product?.item ? TagUtil.getSmallImageLink(product.item) : "~"
      ),
      TableUtil.newColumn(TagUtil.amountToStr(product?.amount) ?? "~"),
      TableUtil.newColumn(TagUtil.minuteToStr(product?.minute) ?? "~"),
    ];

    if (i == 0) {
      columns.push(TableUtil.newColumn(`${recipe.productionTime}秒`));
      if (building2) {
        columns.push(TableUtil.newColumn(`${recipe.productionTime2}click`));
      }
    } else {
      columns.push(TableUtil.newColumn("~"));
      if (building2) {
        columns.push(TableUtil.newColumn("~"));
      }
    }

    rows.push(TableUtil.newRow(columns));
  }

  return { rows, wikiPreLines: pre, wikiPostLines: ["#br"] };
};

//
// アイテム・装備品のWIKI用テーブルを作成します。
//
export const createRecipesForItemData = (
  itemId: string,
  recipes?: TRecipe[]
): TTableData => {
  if (recipes == null) {
    return { rows: [TableUtil.newRow([])] };
  }

  const rows: TTableRow[] = [];
  rows.push(
    TableUtil.newRow(
      [
        { tags: [], attr: { textAlign: "center", width: 60 } },
        { tags: [], attr: { textAlign: "left", width: 200 } },
        { tags: [], attr: { textAlign: "left", width: 240 } },
        { tags: [], attr: { textAlign: "right", width: 30 } },
        { tags: [], attr: { textAlign: "right", width: 40 } },
        { tags: [], attr: { textAlign: "right", width: 30 } },
      ],
      TableUtil.ROW_FORMATTING
    )
  );

  const attr: CSSProperties = { background: "Gold", textAlign: "center" };
  rows.push(
    TableUtil.newRow(
      [
        { tags: ["種類"], attr },
        { tags: ["レシピ名"], attr },
        { tags: ["作成物"], attr },
        { tags: ["消費&br;個数"], attr },
        { tags: ["消費&br;速度"], attr },
        { tags: ["作成&br;個数"], attr },
      ],
      TableUtil.ROW_HEADER
    )
  );

  for (const recipe of recipes) {
    const ingredient = RecipeUtil.findIngredient(recipe, itemId);
    const product = recipe.products[0];
    const columns = [
      ItemUtil.getTypeName(product.item!),
      TagUtil.getLink(recipe.name, recipe.wikiLink),
      TagUtil.getSmallImageLink(product.item!),
      TagUtil.amountToStr(ingredient?.amount) ?? "",
      TagUtil.minuteToStr(ingredient?.minute) ?? "",
      TagUtil.amountToStr(product.amount) ?? "",
    ];
    rows.push(TableUtil.newRow(columns));
  }

  return { rows };
};

//
// 手動設置する設備のWIKI用テーブルを作成します。
//
export const createRecipesForBuildingData = (
  itemId: string,
  recipes?: TRecipe[]
): TTableData => {
  if (recipes == null) {
    return { rows: [TableUtil.newRow([])] };
  }

  const rows: TTableRow[] = [];
  rows.push(
    TableUtil.newRow(
      [
        { tags: [], attr: { textAlign: "center", width: 120 } },
        { tags: [], attr: { textAlign: "center", width: 120 } },
        { tags: [], attr: { textAlign: "left", width: 240 } },
        { tags: [], attr: { textAlign: "right", width: 30 } },
      ],
      TableUtil.ROW_FORMATTING
    )
  );

  const attr: CSSProperties = { background: "Gold", textAlign: "center" };
  rows.push(
    TableUtil.newRow(
      [
        { tags: ["大分類"], attr },
        { tags: ["小分類"], attr },
        { tags: ["作成物"], attr },
        { tags: ["消費&br;個数"], attr },
      ],
      TableUtil.ROW_HEADER
    )
  );

  const recipeRows: { i: number; row: TTableRow }[] = [];
  for (const recipe of recipes) {
    const ingredient = RecipeUtil.findIngredient(recipe, itemId);
    const product = recipe.products[0].building;
    const columns = [
      product?.category ?? "",
      product?.subcategory ?? "",
      TagUtil.getSmallImageLink(product!),
      TagUtil.amountToStr(ingredient?.amount) ?? "",
    ];
    recipeRows.push({ i: 0, row: TableUtil.newRow(columns) });
  }

  const nRecipeRows = recipeRows
    .sort((a, b) => a.i - b.i)
    .map((a) => a?.row)
    .filter((a) => a != null);
  return { rows: rows.concat(nRecipeRows) };
};

//
// マイルストーンのWIKI用テーブルを作成します。
//
export const createMilestonesData = (
  itemId: string,
  milestones?: TCondition[]
): TTableData => {
  if (milestones == null) {
    return { rows: [TableUtil.newRow([])] };
  }

  const rows: TTableRow[] = [];
  rows.push(
    TableUtil.newRow(
      [
        { tags: [], attr: { textAlign: "center", width: 120 } },
        { tags: [], attr: { textAlign: "left", width: 250 } },
        { tags: [], attr: { textAlign: "right", width: 50 } },
      ],
      TableUtil.ROW_FORMATTING
    )
  );

  const attr: CSSProperties = { background: "Gold", textAlign: "center" };
  rows.push(
    TableUtil.newRow(
      [
        { tags: ["ティア"], attr },
        { tags: ["マイルストーン名"], attr },
        { tags: ["個数"], attr },
      ],
      TableUtil.ROW_HEADER
    )
  );

  for (const milestone of milestones) {
    const item = ConditionUtil.findItem(milestone, itemId);
    rows.push(
      TableUtil.newRow([
        `ティア${milestone.tier}`,
        TagUtil.getLink(milestone.name, milestone.wikiLink),
        TagUtil.amountToStr(item?.amount) ?? "",
      ])
    );
  }

  return { rows };
};

//
// 分子分析機のWIKI用テーブルを作成します。
//
export const createResearchesData = (
  itemId: string,
  researches?: TCondition[]
): TTableData => {
  if (researches == null) {
    return { rows: [TableUtil.newRow([])] };
  }

  const rows: TTableRow[] = [];
  rows.push(
    TableUtil.newRow(
      [
        { tags: [], attr: { textAlign: "center", width: 120 } },
        { tags: [], attr: { textAlign: "left", width: 250 } },
        { tags: [], attr: { textAlign: "right", width: 50 } },
      ],
      TableUtil.ROW_FORMATTING
    )
  );

  const attr: CSSProperties = { background: "Gold", textAlign: "center" };
  rows.push(
    TableUtil.newRow(
      [
        { tags: ["カテゴリ"], attr },
        { tags: ["名称"], attr },
        { tags: ["個数"], attr },
      ],
      TableUtil.ROW_HEADER
    )
  );

  for (const research of researches) {
    const item = ConditionUtil.findItem(research, itemId);
    rows.push(
      TableUtil.newRow([
        `${research.category}`,
        TagUtil.getLink(research.name, research.wikiLink),
        TagUtil.amountToStr(item?.amount) ?? "",
      ])
    );
  }

  return { rows };
};
