import React from "react";
import { useRouter } from "next/router";
import { useDrop } from "react-dnd";
import * as Icon from "@heroicons/react/24/outline";
import {
  TRecipe,
  paramToStr,
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
import { actions } from "@/features/compchartSlice";

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

//
// メインコンポーネント
//
const CompChartPage: React.FC = () => {
  const { query } = useRouter();
  const chartId = paramToStr(query.id) ?? "";
  const chart = useAppSelector((state) =>
    state.compCharts.charts.find((c) => c.id === chartId)
  );
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [recipes, setRecipes] = React.useState<TRecipe[]>([]);
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

  React.useEffect(() => {
    const getRecipes = async (page: number) => {
      return await fetcher<TRecipe[]>(`/api/v1/recipes?page=${page}`);
    };

    const func = async () => {
      let rs: TRecipe[] = [];

      for (let page = 0; ; page++) {
        const partial = await getRecipes(page);
        rs = rs.concat(partial);
        setRecipes(rs);
        if (partial.length < 50) break;
      }
    };

    func();
  }, []);

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
        dispatch(actions.deleteRecipe({ chartId, selIndex, recipe }));
      }
    },
    [dispatch, chartId]
  );

  const {
    recipeSels = [],
    productAmounts = [],
    ingredients = [],
  } = chart ?? {};

  const handleCompChart = React.useCallback(async () => {
    const charts = await executeCompChart(
      recipeSels,
      productAmounts,
      ingredients
    );
    console.log(charts);
    setChartData(createCompChartData(charts, ingredients, items ?? []));
  }, [recipeSels, productAmounts, ingredients, items]);

  if (chart == null) {
    return (
      <div className="col-span-full mb-2 text-red-400">
        レシピ比較表が見つかりません。
      </div>
    );
  }

  return (
    <OutsideDropArea
      onDrop={handleDropOutside}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <PageHead title="レシピ比較表" />

      <div className="col-span-full flex mb-2">
        <h1 className="flex-none inline-block text-3xl my-auto text-gray-800">
          レシピ比較表:
        </h1>
        <input
          type="text"
          className="flex-1 inline-block font-semibold text-2xl p-2 ml-2 my-auto min-w-[4rem] border border-gray-400 rounded-lg"
          title="名前"
          value={chart?.name ?? ""}
          onChange={(ev) =>
            dispatch(
              actions.setChart({ ...(chart ?? {}), name: ev.target.value })
            )
          }
        />
      </div>

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
            chartId={chartId}
            selIndex={index}
            recipeSel={recipeSel}
            ingredients={ingredients}
            hasDelete={recipeSels.length > 1}
          />
        ))}

        <h2 className="flex-none text-2xl font-bold mt-4 mb-1">
          生産物一覧
          <span className="float-right font-normal">
            <button
              className="size-6 text-blue-400 align-bottom"
              onClick={() => dispatch(actions.addProductAmount({ chartId }))}
            >
              <Icon.ArrowDownOnSquareIcon />
            </button>
          </span>
        </h2>
        <ProductAmountTable
          chartId={chartId}
          productAmounts={productAmounts}
          itemOptions={itemOptions}
        />

        <h2 className="flex-none text-2xl font-bold mt-4 mb-1">原料一覧</h2>
        <IngredientMultiSelect
          chartId={chartId}
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
