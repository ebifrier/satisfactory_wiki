import React from "react";
import { router } from "@inertiajs/react";
import { TCondition, TItem, TRecipe } from "../types";
import {
  TableUtil,
  createRecipeData,
  createRecipesForBuildingData,
  createRecipesForItemData,
  createMilestonesData,
  createResearchesData,
} from "../table";
import { TableData } from "../components/table";

type Props = {
  selectedItem?: TItem;
  itemsByCategory: [string, TItem[]][];
  recipesProducing: TRecipe[];
  recipesForItem: TRecipe[];
  recipesForBuilding: TRecipe[];
  milestones: TCondition[];
  researches: TCondition[];
};

function App({
  selectedItem,
  itemsByCategory,
  recipesProducing,
  recipesForItem,
  recipesForBuilding,
  milestones,
  researches,
}: Props) {
  const onChangeItemId = React.useCallback(
    (ev: React.ChangeEvent<HTMLSelectElement>) => {
      router.get("/item", { item_id: ev.target.value });
    },
    []
  );

  const recipesProducingData = React.useMemo(
    () =>
      recipesProducing.map((recipe) =>
        createRecipeData(selectedItem?.id!, recipe)
      ),
    [selectedItem?.id, recipesProducing]
  );

  const recipesForItemData = React.useMemo(
    () => createRecipesForItemData(selectedItem?.id!, recipesForItem),
    [selectedItem?.id, recipesForItem]
  );

  const recipesForBuildingData = React.useMemo(
    () => createRecipesForBuildingData(selectedItem?.id!, recipesForBuilding),
    [selectedItem?.id, recipesForBuilding]
  );

  const milestonesData = React.useMemo(
    () => createMilestonesData(selectedItem?.id!, milestones),
    [selectedItem?.id, milestones]
  );

  const researchesData = React.useMemo(
    () => createResearchesData(selectedItem?.id!, researches),
    [selectedItem?.id, researches]
  );

  return (
    <div className="bg-white grid grid-cols-1 md:grid-cols-[2fr_1fr] max-w-6xl gap-x-4 gap-y-2 mx-auto p-6 rounded-lg shadow-md">
      <div className="col-span-full">
        <h1 className="text-4xl font-bold text-gray-800">素材詳細</h1>
      </div>

      <div className="mt-6 col-span-full">
        <form method="get" action="/item">
          <select
            id="item-select"
            name="item_id"
            defaultValue={selectedItem?.id}
            onChange={onChangeItemId}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">-- 素材を選択 --</option>
            {itemsByCategory.map(([cat, items], index) => (
              <optgroup key={index} label={`${cat}`}>
                {items.map((item) => (
                  <option key={item.index} value={item.id}>
                    {`${item.name} (${item.id.replace("_", " ")})`}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {/*<a className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                   href={`/items?Item_Id=${}`}>
                    アイテムを選択
                </a>*/}
        </form>
      </div>

      <div className="mt-6 col-span-full">
        <h1 className="text-4xl font-bold text-gray-800">
          {selectedItem?.name}
        </h1>
      </div>

      <div className="mt-6 col-span-full">
        <h2 className="text-2xl font-semibold">作成レシピ</h2>
      </div>

      {recipesProducingData.length > 0 ? (
        <>
          <div className="recipes-producing-table">
            {recipesProducingData.map((recipe) => (
              <TableData data={recipe} />
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
        <p className="col-span-2 text-gray-500">No recipes use this item.</p>
      )}

      <div className="mt-8 col-span-full">
        <h2 className="text-2xl font-semibold">利用先 部品・装備品</h2>
      </div>

      {recipesForItemData.rows.length > 2 ? (
        <>
          <TableData data={recipesForItemData} />

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${TableUtil.dataToWIKI(recipesForItemData)}\n`}
          ></textarea>
        </>
      ) : (
        <p className="col-span-2 text-gray-500">No recipes use this item.</p>
      )}

      <div className="mt-8 col-span-full">
        <h2 className="text-2xl font-semibold">利用先 設備・車両</h2>
      </div>

      {recipesForBuildingData.rows.length > 2 ? (
        <>
          <TableData data={recipesForBuildingData} />

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${TableUtil.dataToWIKI(recipesForBuildingData)}\n`}
          ></textarea>
        </>
      ) : (
        <p className="col-span-2 text-gray-500">No recipes use this item.</p>
      )}

      <div className="mt-8 col-span-full">
        <h2 className="text-2xl font-semibold">マイルストーン</h2>
      </div>

      {milestonesData.rows.length > 2 ? (
        <>
          <TableData data={milestonesData} />

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${TableUtil.dataToWIKI(milestonesData)}\n`}
          ></textarea>
        </>
      ) : (
        <p className="col-span-2 text-gray-500">No milestones use this item.</p>
      )}

      <div className="mt-8 col-span-full">
        <h2 className="text-2xl font-semibold">分子分析機</h2>
      </div>

      {researchesData.rows.length > 2 ? (
        <>
          <TableData data={researchesData} />

          <textarea
            className="w-full h-full border border-gray-500 focus:border-blue-500"
            wrap="off"
            placeholder="placeholder"
            defaultValue={`${TableUtil.dataToWIKI(researchesData)}\n`}
          ></textarea>
        </>
      ) : (
        <p className="col-span-2 text-gray-500">No milestones use this item.</p>
      )}
    </div>
  );
}

export default App;
