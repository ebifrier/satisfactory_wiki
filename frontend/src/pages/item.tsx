import React from "react";
import { useRouter } from "next/router";
import Select, { GroupBase } from "react-select";
import useSWR from "swr";
import axios from "axios";
import {
  Option,
  GroupOption,
  TCondition,
  TItem,
  TRecipe,
  toDisplayId,
} from "@/types";
import { TableUtil, TTableData } from "@/table";
import {
  createRecipeData,
  createRecipesForBuildingData,
  createRecipesForItemData,
  createMilestonesData,
  createResearchesData,
} from "@/table_ext";
import { TableData } from "@/components/table";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
console.log(API_URL);

async function fetcher<T>(url: string): Promise<T> {
  return axios.get(`${API_URL}${url}`).then((res) => res.data);
}

type DataTableWithTitleProps = {
  data: TTableData;
  title: string;
};

const DataTableWithTitle: React.FC<DataTableWithTitleProps> = ({
  data,
  title,
}) => {
  return (
    <>
      <div className="mt-8 col-span-full">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {data.rows.length > 2 ? (
        <>
          <TableData data={data} />

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${TableUtil.dataToWIKI(data)}\n`}
          ></textarea>
        </>
      ) : (
        <p className="col-span-full text-gray-500">
          表示する項目はありません。
        </p>
      )}
    </>
  );
};

type Recipes = {
  recipesProducing?: TRecipe[];
  recipesForItem?: TRecipe[];
  recipesForBuilding?: TRecipe[];
};

function IndexPage() {
  const router = useRouter();
  const [itemId, setItemId] = React.useState<string>();

  React.useEffect(() => {
    const { itemId: defaultId } = router.query;
    setItemId(defaultId ? `${defaultId}` : undefined);
  }, [router.query]);

  const { data: itemsByCategory } = useSWR<[string, TItem[]][]>(
    "/api/v1/items?grouping=true",
    fetcher
  );

  const itemOptions: GroupOption[] = React.useMemo(
    () =>
      itemsByCategory == null
        ? []
        : itemsByCategory.map(([cat, items]) => ({
            label: cat,
            options: items.map((item) => ({
              label: `${item.name} (${toDisplayId(item.id)})`,
              value: item.id,
            })),
          })),
    [itemsByCategory]
  );

  const selectedOption = React.useMemo(() => {
    for (const { options } of itemOptions ?? []) {
      const option = options.find((x) => x.value === itemId);
      if (option != null) {
        return option;
      }
    }
    return undefined;
  }, [itemId, itemOptions]);

  const { data: recipes } = useSWR<Recipes>(
    `/api/v1/item/${itemId}/recipes?producing=true&for_item=true&for_building=true`,
    fetcher
  );

  const recipesProducingData = React.useMemo(
    () =>
      recipes?.recipesProducing?.map((recipe) =>
        createRecipeData(itemId ?? "", recipe)
      ) ?? [],
    [itemId, recipes?.recipesProducing]
  );

  const recipesForItemData = React.useMemo(
    () => createRecipesForItemData(itemId ?? "", recipes?.recipesForItem),
    [itemId, recipes?.recipesForItem]
  );

  const recipesForBuildingData = React.useMemo(
    () =>
      createRecipesForBuildingData(itemId ?? "", recipes?.recipesForBuilding),
    [itemId, recipes?.recipesForBuilding]
  );

  const { data: milestones } = useSWR<TCondition[]>(
    `/api/v1/item/${itemId}/milestones`,
    fetcher
  );

  const milestonesData = React.useMemo(
    () => createMilestonesData(itemId ?? "", milestones),
    [itemId, milestones]
  );

  const { data: researches } = useSWR<TCondition[]>(
    `/api/v1/item/${itemId}/researches`,
    fetcher
  );

  const researchesData = React.useMemo(
    () => createResearchesData(itemId ?? "", researches),
    [itemId, researches]
  );

  return (
    <div className="bg-white grid grid-cols-1 md:grid-cols-[2fr_1fr] max-w-6xl gap-x-4 gap-y-2 mx-auto p-6 rounded-lg shadow-md">
      <div className="col-span-full">
        <h1 className="text-4xl font-bold text-gray-800">素材詳細</h1>
      </div>

      <div className="mt-6 col-span-full">
        <Select<Option, false, GroupBase<Option>>
          id="item-select"
          options={itemOptions}
          value={selectedOption}
          onChange={(option) => setItemId(option?.value)}
          isSearchable={true}
          className="mt-1 sm:text-sm"
        />
      </div>

      <div className="mt-6 col-span-full">
        <h1 className="text-4xl font-bold text-gray-800">
          {selectedOption?.label}
        </h1>
      </div>

      <div className="mt-6 col-span-full">
        <h2 className="text-2xl font-semibold">作成レシピ</h2>
      </div>

      {recipesProducingData.length > 0 ? (
        <>
          <div className="recipes-producing-table">
            {recipesProducingData.map((recipe, index) => (
              <TableData key={index} data={recipe} />
            ))}
          </div>
          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${recipesProducingData
              .map((recipe) => TableUtil.dataToWIKI(recipe))
              .join("\n")}\n`}
          ></textarea>
        </>
      ) : (
        <p className="col-span-2 text-gray-500">表示する項目はありません。</p>
      )}

      <DataTableWithTitle
        title="利用先 部品・装備品"
        data={recipesForItemData}
      />

      <DataTableWithTitle
        title="利用先 設備・車両"
        data={recipesForBuildingData}
      />

      <DataTableWithTitle title="マイルストーン" data={milestonesData} />
      <DataTableWithTitle title="分子分析機" data={researchesData} />
    </div>
  );
}

export default IndexPage;
