import React from "react";
import { useRouter } from "next/router";
import { useDrop } from "react-dnd";
import * as SolidIcon from "@heroicons/react/24/solid";
import {
  TRecipe,
  paramToStr,
  fetcher,
  useAppDispatch,
  useAppSelector,
  TTableData,
  TableUtil,
  createCompChartData,
  executeCompChart,
} from "@/index";
import {
  PageHead,
  TableData,
  ItemTypes,
  AddButton,
  RecipeSelection,
  DraggableRecipe,
  ProductAmountTable,
  IngredientTable,
  useItemOptions,
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

const tabList = ["レシピ編成", "原料／生産物", "WIKIテーブル"];

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
  const [activeTab, setActiveTab] = React.useState(0);
  const [chartData, setChartData] = React.useState<TTableData>();
  const [chartErrors, setChartErrors] = React.useState<string[]>();
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
    const { charts, errors } = await executeCompChart(
      recipeSels,
      productAmounts,
      ingredients
    );
    console.log(charts, errors);

    if (errors.length === 0) {
      setChartData(createCompChartData(charts, ingredients, items ?? []));
    }

    setChartErrors(errors);
    setActiveTab(2);
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
      id="main"
      className={`flex-1 flex flex-col 2xl:max-w-8xl ${
        activeTab === 0 ? "overflow-y-hidden" : ""
      }`}
      onDrop={handleDropOutside}
    >
      <PageHead title="レシピ比較表" />

      <div className="flex flex-none mb-2">
        <h1 className="flex-none inline-block text-2xl my-auto text-gray-800">
          レシピ比較表:
        </h1>
        <input
          type="text"
          className="flex-1 inline-block font-semibold text-xl p-2 ml-2 my-auto min-w-[4rem] border border-gray-400 rounded-lg"
          placeholder="名前"
          title="比較表の名前"
          value={chart?.name ?? ""}
          onChange={(ev) =>
            dispatch(
              actions.setChart({ ...(chart ?? {}), name: ev.target.value })
            )
          }
        />
      </div>

      <ul className="flex flex-wrap flex-none mt-6 mb-6 text-sm font-medium text-center text-gray-500 border-b border-gray-300">
        {tabList.map((tabName, index) => (
          <li key={tabName} className="me-2">
            <button
              type="button"
              className={`inline-block p-4 rounded-t-lg ${
                index === activeTab
                  ? "text-gray-800 bg-gray-100 active"
                  : "text-gray-700 hover:text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tabName}
            </button>
          </li>
        ))}
        <li className="ms-auto me-0 my-auto">
          <button
            type="button"
            className="py-2 px-4 min-w-[5rem] bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full"
            title="表の作成を行います。"
            onClick={handleCompChart}
          >
            表を作成
          </button>
        </li>
      </ul>

      {/* レシピ編成タブ */}
      <div
        className={`flex-1 overflow-y-hidden grid grid-cols-1 md:grid-cols-[4fr_5fr] gap-4 ${
          activeTab === 0 ? "" : "hidden"
        }`}
      >
        <div className="overflow-y-hidden flex-1 flex flex-col p-4 m-1 bg-white rounded-lg shadow-md">
          {/* <h2 className="flex-none text-2xl font-bold mb-2">レシピ一覧</h2> */}
          <input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full flex-none p-3 border border-gray-400 rounded-lg mb-3"
          />
          <div className="flex-1 overflow-auto">{FilteredDraggableRecipes}</div>
        </div>

        <div className="flex-1 flex flex-col p-4 m-1 bg-white rounded-lg shadow-md overflow-auto">
          <h2 className="flex-none mt-2">
            <span className="text-2xl font-bold">レシピ編成</span>
            <AddButton
              className="inline align-bottom float-right"
              content="レシピ編成を追加"
              onClick={() => dispatch(actions.addRecipeSel({ chartId }))}
            />
          </h2>
          {recipeSels.map((recipeSel, index) => (
            <RecipeSelection
              key={index}
              chartId={chartId}
              selIndex={index}
              recipeSel={recipeSel}
              ingredients={ingredients}
            />
          ))}
        </div>
      </div>

      {/* 原料／生産物タブ */}
      <div className={`flex-1 ${activeTab === 1 ? "" : "hidden"}`}>
        <h2 className="mb-1">
          <span className="text-2xl font-bold">原料一覧</span>
          <AddButton
            className="inline align-bottom float-right"
            content="原料を追加"
            onClick={() => dispatch(actions.addIngredient({ chartId }))}
          />
        </h2>
        <IngredientTable
          chartId={chartId}
          ingredients={ingredients}
          itemOptions={itemOptions}
        />

        <h2 className="mt-6 mb-1">
          <span className="text-2xl font-bold">生産物一覧</span>
          <AddButton
            className="inline align-bottom float-right"
            content="生産物を追加"
            onClick={() => dispatch(actions.addProductAmount({ chartId }))}
          />
        </h2>
        <ProductAmountTable
          chartId={chartId}
          productAmounts={productAmounts}
          itemOptions={itemOptions}
        />
      </div>

      {/* WIKIテーブルタブ */}
      <div className={`flex-1 ${activeTab === 2 ? "" : "hidden"}`}>
        {chartErrors != null && chartErrors.length > 0 ? (
          <div
            className="items-center p-4 mb-4 text-sm border rounded-lg bg-gray-800 text-red-400 border-red-800"
            role="alert"
          >
            <p className="text-xl font-bold">
              <SolidIcon.ExclamationCircleIcon className="inline size-6 align-top me-1" />
              <span className="inline align-middle">実行エラー</span>
            </p>
            <ul className="mt-3">
              {chartErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <h2 className="text-2xl font-bold mb-1">テーブル</h2>
        {chartData == null ? (
          <p className="text-gray-500">データはありません。</p>
        ) : chartData.rows.length <= 2 ? (
          <p className="text-gray-500">表示する項目はありません。</p>
        ) : (
          <TableData data={chartData} />
        )}

        <h2 className="text-2xl font-bold mt-6 mb-1">WIKI用</h2>
        <textarea
          className="w-full border border-gray-500 focus:outline-blue-400 min-h-[300px]"
          wrap="off"
          placeholder="placeholder"
          readOnly
          value={wikiText}
        ></textarea>
      </div>
    </OutsideDropArea>
  );
};

export default CompChartPage;
