import React from "react";
import useSWR from "swr";
import Select from "react-select";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as Icon from "@heroicons/react/24/outline";
import {
  Option,
  TRecipe,
  fetcher,
  useItemOptions,
  findSelectedItem,
  TTableData,
  TableUtil,
} from "@/index";
import { TableData } from "@/components";
import {
  TRecipeSelection,
  TProductAmount,
  RecipeSelectionUtil,
  createCompChartData,
  executeCompChart,
  ProductAmountUtil,
} from "./_compchartTypes";
import {
  ItemTypes,
  DraggableRecipe,
  RecipeSelection,
} from "./_compchartComponents";

// 範囲外のドロップエリア
const OutsideDropArea: React.FC<
  React.PropsWithChildren<
    Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> & {
      onDrop: (recipe: TRecipe) => void;
    }
  >
> = ({ children, onDrop, ...args }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.RECIPE,
    drop: (item: { recipe: TRecipe }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      onDrop(item.recipe);
    },
  }));

  drop(ref);
  return (
    <div ref={ref} {...args}>
      {children}
    </div>
  );
};

const getDefaultRecipeSels = (recipes: TRecipe[]): TRecipeSelection[] => {
  const findRecipe = (recipeId: string): TRecipe => {
    return recipes.find((r) => r.id === recipeId)!;
  };

  const recipesArray = [
    ["Iron_Ingot", "Iron_Plate", "Iron_Rod", "Screw", "Reinforced_Iron_Plate"],
    ["Cast_Screw", "Iron_Plate", "Reinforced_Iron_Plate"],
    ["Bolted_Iron_Plate", "Cast_Screw", "Iron_Plate"],
    ["Iron_Plate", "Iron_Wire", "Stitched_Iron_Plate"],
    ["Iron_Plate", "Stitched_Iron_Plate", "Wire"],

    /*["Caterium_Ingot", "Reanimated_SAM", "Ficsite_Ingot_(Caterium)"],
    ["Pure_Caterium_Ingot", "Reanimated_SAM", "Ficsite_Ingot_(Caterium)"],
    [
      "Bauxite_(Caterium)",
      "Reanimated_SAM",
      "Ficsite_Ingot_(Aluminum)",
      "Pure_Aluminum_Ingot",
      "Electrode_Aluminum_Scrap",
      "Sloppy_Alumina",
      "Heavy_Oil_Residue",
      "Petroleum_Coke",
    ],*/
  ];

  return recipesArray.map((recipes) => ({
    name: "",
    recipes: recipes.map(findRecipe),
  }));
};

// メインコンポーネント
const RecipePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const { data: recipes } = useSWR<TRecipe[]>("/api/v1/recipes", fetcher);
  const { itemOptions, data: itemsByGroup } = useItemOptions();
  const items = React.useMemo(
    () => itemsByGroup?.map(([, items]) => items)?.flat(),
    [itemsByGroup]
  );

  const [recipeSels, setRecipeSels] = React.useState<TRecipeSelection[]>([
    { name: "", recipes: [] },
  ]);
  const [productAmounts, setProductAmounts] = React.useState<TProductAmount[]>([
    { amount: 100, itemId: "Ficsite_Ingot" },
    { amount: 0, itemId: "Bauxite" },
  ]);
  const [chartData, setChartData] = React.useState<TTableData>();

  React.useEffect(() => {
    if (recipes == null) return;
    setRecipeSels(getDefaultRecipeSels(recipes));
  }, [recipes]);

  // 検索ワードによるフィルタリング
  const filteredRecipes = React.useMemo(
    () =>
      recipes?.filter(
        (recipe) =>
          recipe.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [recipes, searchTerm]
  );

  const productOptions = React.useMemo(
    () =>
      productAmounts.map((product) =>
        findSelectedItem(product.itemId, itemOptions)
      ),
    [productAmounts, itemOptions]
  );

  const handleDropOutside = React.useCallback((recipe: TRecipe) => {
    setRecipeSels((prev) =>
      prev.map((rs) => RecipeSelectionUtil.removeRecipe(rs, recipe))
    );
  }, []);

  const handleSetRecipeSel = React.useCallback(
    (index: number, recipeSel?: TRecipeSelection, insert?: boolean) =>
      setRecipeSels((prev) =>
        RecipeSelectionUtil.updateSel(prev, index, recipeSel, insert)
      ),
    []
  );

  const handleSetProductAmount = React.useCallback(
    (product: TProductAmount, index: number) =>
      setProductAmounts((prev) =>
        prev.map((pd, i) => (i == index ? product : pd))
      ),
    []
  );

  const handleDeleteProductAmounts = React.useCallback(
    (index: number) =>
      setProductAmounts((prev) => ProductAmountUtil.remove(prev, index)),
    []
  );

  const handleCompChart = React.useCallback(async () => {
    const charts = await executeCompChart(recipeSels, productAmounts);
    //console.log(createCompChartData(charts, items ?? []));
    setChartData(createCompChartData(charts, items ?? []));
  }, [recipeSels, productAmounts, items]);

  return (
    <DndProvider backend={HTML5Backend}>
      <OutsideDropArea
        onDrop={handleDropOutside}
        className="grid grid-cols-2 gap-4 bg-white m-4"
      >
        {/* 左側: レシピ一覧と検索フィルター */}
        <div className="p-4 flex flex-col" style={{ maxHeight: "90vh" }}>
          <h2 className="flex-none text-2xl font-bold mb-3">レシピ一覧</h2>
          <input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full flex-none p-3 border rounded-lg mb-3"
          />
          <div className="flex-1 overflow-auto">
            {filteredRecipes?.map((recipe) => (
              <DraggableRecipe key={recipe.id} recipe={recipe} full={true} />
            ))}
          </div>
        </div>

        {/* 右側: 使用するレシピのドロップエリア */}
        <div className="p-4 flex flex-col bg-white rounded-lg shadow-md">
          <h2 className="flex-none text-2xl font-bold">使用レシピ一覧</h2>
          {recipeSels.map((recipeSel, index) => (
            <RecipeSelection
              key={index}
              index={index}
              recipeSel={recipeSel}
              setRecipeSel={handleSetRecipeSel}
              hasDelete={recipeSels.length > 1}
            />
          ))}

          <h2 className="flex-none text-2xl font-bold mt-4 mb-4">生産物一覧</h2>
          <table>
            <thead>
              <tr>
                <td className="text-center">生産物</td>
                <td className="text-center">生産個数</td>
                <td className="text-center">削除</td>
              </tr>
            </thead>
            <tbody>
              {productAmounts.map((product, index) => (
                <tr key={index}>
                  <td>
                    <Select<Option, false>
                      options={itemOptions}
                      value={productOptions[index]}
                      onChange={(option) =>
                        handleSetProductAmount(
                          { ...product, itemId: option?.value },
                          index
                        )
                      }
                      isSearchable={true}
                      className="sm:text-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="text-right"
                      min={0}
                      value={product.amount}
                      onChange={(ev) =>
                        handleSetProductAmount(
                          { ...product, amount: parseInt(ev.target.value) },
                          index
                        )
                      }
                    />
                  </td>
                  <td className="text-center">
                    <button
                      disabled={productAmounts.length <= 1}
                      className="size-6 text-red-500 disabled:text-gray-200"
                      onClick={() => handleDeleteProductAmounts(index)}
                    >
                      <Icon.TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* <Select<Option, true>
            options={itemOptions}
            isMulti={true}
            onChange={handleChange}
            // value={productOptions[index]}
            // onChange={(option) =>
            //   handleSetProductAmount(
            //     { ...product, itemId: option?.value },
            //     index
            //   )
            // }
            isSearchable={true}
            closeMenuOnSelect={false}
            className="sm:text-sm"
          /> */}
        </div>

        <button
          className="col-span-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={handleCompChart}
        >
          計算
        </button>
        <div className="col-span-full border border-gray-500">
          {chartData == null ? (
            <p className="col-span-full text-gray-500">データはありません。</p>
          ) : chartData.rows.length <= 2 ? (
            <p className="col-span-full text-gray-500">
              表示する項目はありません。
            </p>
          ) : (
            <TableData data={chartData} />
          )}

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            value={`${TableUtil.dataToWIKI(chartData)}\n`}
          ></textarea>
        </div>
      </OutsideDropArea>
    </DndProvider>
  );
};

export default RecipePage;
