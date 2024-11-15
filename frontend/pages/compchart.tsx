import React from "react";
import useSWR from "swr";
import { useDrop } from "react-dnd";
import * as Icon from "@heroicons/react/24/outline";
import {
  TRecipe,
  fetcher,
  useAppDispatch,
  useAppSelector,
  useItemOptions,
  TTableData,
  TableUtil,
  createCompChartData,
  executeCompChart,
} from "@/index";
import {
  PageHead,
  TableData,
  ItemTypes,
  RecipeSelection,
  DraggableRecipe,
  ProductAmountTable,
  IngredientMultiSelect,
} from "@/components";
import { actions } from "@/slices/compchartSlice";

//
// 範囲外のドロップエリア
//
const OutsideDropArea: React.FC<
  React.PropsWithChildren<
    Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> & {
      onDrop: (recipe: TRecipe, selIndex?: number) => void;
    }
  >
> = ({ children, onDrop, ...args }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.RECIPE,
    drop: (item: { recipe: TRecipe; selIndex?: number }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      onDrop(item.recipe, item.selIndex);
    },
  }));

  drop(ref);
  return (
    <div ref={ref} {...args}>
      {children}
    </div>
  );
};

// const getDefaultRecipeSels = (recipes: TRecipe[]): TRecipeSelection[] => {
//   const findRecipe = (recipeId: string): TRecipe => {
//     return recipes.find((r) => r.id === recipeId)!;
//   };
//   const makeRecipes = (recipeIds: string[]): TRecipe[] => {
//     return recipeIds.map((id) => findRecipe(id));
//   };

//   return [
//     {
//       name: "基本",
//       recipes: makeRecipes([
//         "Iron_Ingot",
//         "Iron_Plate",
//         "Iron_Rod",
//         "Screw",
//         "Reinforced_Iron_Plate",
//       ]),
//     },
//     {
//       name: "基本 & 鋳造ネジ",
//       recipes: makeRecipes([
//         "Cast_Screw",
//         "Iron_Plate",
//         "Reinforced_Iron_Plate",
//       ]),
//     },
//     {
//       name: "ネジ留め鉄板 & 鋳造ネジ",
//       recipes: makeRecipes(["Bolted_Iron_Plate", "Cast_Screw", "Iron_Plate"]),
//     },
//     {
//       name: "縫合鉄板 & 鉄のワイヤー",
//       recipes: makeRecipes(["Iron_Plate", "Iron_Wire", "Stitched_Iron_Plate"]),
//     },
//     {
//       name: "縫合鉄板",
//       recipes: makeRecipes(["Iron_Plate", "Stitched_Iron_Plate", "Wire"]),
//     },
//     {
//       name: "鋼鉄のネジ",
//       recipes: makeRecipes([
//         "Steel_Beam",
//         "Steel_Screw",
//         "Iron_Plate",
//         "Reinforced_Iron_Plate",
//       ]),
//     },
//     {
//       name: "ネジ留め鉄板 & 鋼鉄のネジ",
//       recipes: makeRecipes([
//         "Steel_Beam",
//         "Steel_Screw",
//         "Iron_Plate",
//         "Bolted_Iron_Plate",
//       ]),
//     },

//     /*{
//       name: "アルミ通常レシピ",
//       recipes: makeRecipes([
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Aluminum)",
//         "Alumina_Solution",
//         "Aluminum_Scrap",
//         "Aluminum_Ingot",
//         "Silica",
//       ]),
//     },
//     {
//       name: "アルミ代替レシピ",
//       recipes: makeRecipes([
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Aluminum)",
//         "Pure_Aluminum_Ingot",
//         "Electrode_Aluminum_Scrap",
//         "Sloppy_Alumina",
//         "Heavy_Oil_Residue",
//         "Petroleum_Coke",
//       ]),
//     },
//     {
//       name: "カテリウム基本",
//       recipes: makeRecipes([
//         "Caterium_Ingot",
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Caterium)",
//       ]),
//     },
//     {
//       name: "純カテリウムのインゴット",
//       recipes: makeRecipes([
//         "Pure_Caterium_Ingot",
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Caterium)",
//       ]),
//     },
//     {
//       name: "鉱石変換+アルミ通常レシピ",
//       recipes: makeRecipes([
//         "Bauxite_(Caterium)",
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Aluminum)",
//         "Alumina_Solution",
//         "Aluminum_Scrap",
//         "Aluminum_Ingot",
//         "Silica",
//       ]),
//     },
//     {
//       name: "鉱石変換+アルミ代替レシピ",
//       recipes: makeRecipes([
//         "Bauxite_(Caterium)",
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Aluminum)",
//         "Pure_Aluminum_Ingot",
//         "Electrode_Aluminum_Scrap",
//         "Sloppy_Alumina",
//         "Heavy_Oil_Residue",
//         "Petroleum_Coke",
//       ]),
//     },
//     {
//       name: "鉄基本",
//       recipes: makeRecipes([
//         "Iron_Ingot",
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Iron)",
//       ]),
//     },
//     {
//       name: "純鉄のインゴット",
//       recipes: makeRecipes([
//         "Pure_Iron_Ingot",
//         "Reanimated_SAM",
//         "Ficsite_Ingot_(Iron)",
//       ]),
//     },*/
//   ];
// };

//
// メインコンポーネント
//
const CompChartPage: React.FC = () => {
  const { recipeSels, productAmounts, ingredients } = useAppSelector(
    (state) => state.compChart
  );
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const { data: recipes } = useSWR<TRecipe[]>("/api/v1/recipes", fetcher);
  const { itemOptions, data: itemsByGroup } = useItemOptions();
  const items = React.useMemo(
    () => itemsByGroup?.map(([, items]) => items)?.flat(),
    [itemsByGroup]
  );
  const [chartData, setChartData] = React.useState<TTableData>();
  const wikiText = React.useMemo(
    () => `${TableUtil.dataToWIKI(chartData)}\n`,
    [chartData]
  );

  // React.useEffect(() => {
  //   if (recipes == null) return;
  //   dispatch(actions.setRecipeSels(getDefaultRecipeSels(recipes)));
  // }, [dispatch, recipes]);

  // 検索ワードによるフィルタリング
  const FilteredDraggableRecipes = React.useMemo(() => {
    const filteredRecipes = recipes?.filter(
      (recipe) =>
        recipe.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <>
        {filteredRecipes?.map((recipe) => (
          <DraggableRecipe key={recipe.id} recipe={recipe} full={true} />
        ))}
      </>
    );
  }, [recipes, searchTerm]);

  const handleDropOutside = React.useCallback(
    (recipe: TRecipe, selIndex?: number) => {
      if (selIndex != null) {
        dispatch(actions.deleteRecipe({ index: selIndex, recipe }));
      }
    },
    [dispatch]
  );

  const handleCompChart = React.useCallback(async () => {
    const charts = await executeCompChart(
      recipeSels,
      productAmounts,
      ingredients
    );
    const chartData = createCompChartData(charts, ingredients, items ?? []);
    console.log(chartData);
    setChartData(chartData);
  }, [recipeSels, productAmounts, ingredients, items]);

  return (
    <OutsideDropArea
      onDrop={handleDropOutside}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <PageHead title="比較表" />

      <div className="col-span-full mb-2">
        <h1 className="text-4xl font-bold text-gray-800">必要量比較</h1>
      </div>

      {/* 左側: レシピ一覧と検索フィルター */}
      <div
        className="flex flex-col p-4 bg-white rounded-lg shadow-md"
        style={{ maxHeight: "70vh" }}
      >
        <h2 className="flex-none text-2xl font-bold mb-2">レシピ一覧</h2>
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full flex-none p-3 border rounded-lg mb-3"
        />
        <div className="flex-1 overflow-auto">{FilteredDraggableRecipes}</div>
      </div>

      {/* 右側: 使用するレシピのドロップエリア */}
      <div
        className="flex flex-col p-4 bg-white rounded-lg shadow-md overflow-auto"
        style={{ maxHeight: "70vh" }}
      >
        <h2 className="flex-none text-2xl font-bold">使用レシピ一覧</h2>
        {recipeSels.map((recipeSel, index) => (
          <RecipeSelection
            key={index}
            index={index}
            recipeSel={recipeSel}
            hasDelete={recipeSels.length > 1}
          />
        ))}

        <h2 className="flex-none text-2xl font-bold mt-4 mb-1">
          生産物一覧
          <span className="float-right font-normal">
            <button
              className="size-6 text-blue-400 align-bottom"
              onClick={() => dispatch(actions.addProductAmount())}
            >
              <Icon.ArrowDownOnSquareIcon />
            </button>
          </span>
        </h2>
        <ProductAmountTable
          productAmounts={productAmounts}
          itemOptions={itemOptions}
        />

        <h2 className="flex-none text-2xl font-bold mt-4 mb-1">原料一覧</h2>
        <IngredientMultiSelect
          ingredients={ingredients}
          itemOptions={itemOptions}
        />
      </div>

      <button
        className="col-span-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={handleCompChart}
      >
        計算
      </button>

      {chartData == null ? (
        <p className="text-gray-500">データはありません。</p>
      ) : chartData.rows.length <= 2 ? (
        <p className="text-gray-500">表示する項目はありません。</p>
      ) : (
        <TableData data={chartData} />
      )}

      <textarea
        className="border border-gray-500 focus:outline-blue-400"
        wrap="off"
        placeholder="placeholder"
        readOnly
        value={wikiText}
      ></textarea>
    </OutsideDropArea>
  );
};

export default CompChartPage;
