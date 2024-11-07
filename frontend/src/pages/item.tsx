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

async function fetcher<T>(url: string): Promise<T> {
  return axios.get(`${API_URL}${url}`).then((res) => res.data);
}

type DataTableWithTitleProps = {
  title: string;
  data?: TTableData;
};

const DataTableWithTitle: React.FC<DataTableWithTitleProps> = ({
  title,
  data,
}) => {
  return (
    <>
      <div className="mt-8 col-span-full">
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
      {data == null ? (
        <p className="col-span-full text-gray-500">データ読み込み中...</p>
      ) : data.rows.length <= 2 ? (
        <p className="col-span-full text-gray-500">
          表示する項目はありません。
        </p>
      ) : (
        <>
          <TableData data={data} />

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${TableUtil.dataToWIKI(data)}\n`}
          ></textarea>
        </>
      )}
    </>
  );
};

function IndexPage() {
  const paramToStr = (param?: string | string[]): string | undefined =>
    param ? `${param}` : undefined;
  const router = useRouter();
  const itemId = paramToStr(router.query.itemId);

  const setItemId = React.useCallback(
    (value?: string) => {
      if (itemId != value) {
        const { pathname } = router;
        router.replace({ pathname, query: { itemId: value } });
      }
    },
    [router, itemId]
  );

  const { data: itemOptions, error } = useSWR(
    "/api/v1/items?grouping=true",
    async (key: string) => {
      const data = await fetcher<[string, TItem[]][]>(key);
      return data == null
        ? []
        : data.map(
            ([cat, items]): GroupOption => ({
              label: cat,
              options: items.map((item) => ({
                label: `${item.name} (${toDisplayId(item.id)})`,
                value: item.id,
              })),
            })
          );
    }
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

  const { data: recipesProducingData } = useSWR(
    [itemId, `/api/v1/item/${itemId}/recipes/producing`],
    async ([itemId, key]) => {
      const data = itemId != null ? await fetcher<TRecipe[]>(key) : [];
      return data?.map((recipe) => createRecipeData(itemId ?? "", recipe));
    }
  );

  const { data: recipesForItemData } = useSWR(
    [itemId, `/api/v1/item/${itemId}/recipes/using_for_item`],
    async ([itemId, key]) => {
      const data = itemId != null ? await fetcher<TRecipe[]>(key) : [];
      return createRecipesForItemData(itemId ?? "", data);
    }
  );

  const { data: recipesForBuildingData } = useSWR(
    [itemId, `/api/v1/item/${itemId}/recipes/using_for_building`],
    async ([itemId, key]) => {
      const data = itemId != null ? await fetcher<TRecipe[]>(key) : [];
      return createRecipesForBuildingData(itemId ?? "", data);
    }
  );

  const { data: milestonesData } = useSWR(
    [itemId, `/api/v1/item/${itemId}/milestones`],
    async ([itemId, key]) => {
      const data = itemId != null ? await fetcher<TCondition[]>(key) : [];
      return createMilestonesData(itemId ?? "", data);
    }
  );

  const { data: researchesData } = useSWR(
    [itemId, `/api/v1/item/${itemId}/researches`],
    async ([itemId, key]) => {
      const data = itemId != null ? await fetcher<TCondition[]>(key) : [];
      return createResearchesData(itemId ?? "", data);
    }
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

      {recipesProducingData == null ? (
        <p className="col-span-full text-gray-500">データ読み込み中...</p>
      ) : recipesProducingData.length == 0 ? (
        <p className="col-span-full text-gray-500">
          表示する項目はありません。
        </p>
      ) : (
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
