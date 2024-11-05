import React from "react";
import Select, { SingleValue, GroupBase } from "react-select";
import { useRouter } from "next/router";
import {
  Option,
  GroupOption,
  TCondition,
  TItem,
  TRecipe,
  toDisplayId,
} from "@/types";
import {
  TableUtil,
  createRecipeData,
  createRecipesForBuildingData,
  createRecipesForItemData,
  createMilestonesData,
  createResearchesData,
  TTableData,
} from "@/table";
import { TableData } from "@/components/table";

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

type Props = {
  selectedItem?: TItem;
  itemsByCategory: [string, TItem[]][];
  recipesProducing: TRecipe[];
  recipesForItem: TRecipe[];
  recipesForBuilding: TRecipe[];
  milestones: TCondition[];
  researches: TCondition[];
};

function IndexPage({}: // selectedItem,
// itemsByCategory,
// recipesProducing,
// recipesForItem,
// recipesForBuilding,
// milestones,
// researches,
Props) {
  const router = useRouter();
  const onChangeItemId = React.useCallback(
    (option: SingleValue<Option>) => {
      router.push(`/item?item_id=${option?.value}`);
    },
    [router]
  );

  return (
    <div>
      <h1>title</h1>
    </div>
  );

  /*const itemOptions: GroupOption[] = React.useMemo(
    () =>
      itemsByCategory.map(([cat, items]) => ({
        label: `${cat}`,
        options: items.map((item) => ({
          label: `${item.name} (${toDisplayId(item.id)})`,
          value: item.id,
        })),
      })),
    [itemsByCategory]
  );

  const selectedOption: Option | undefined = React.useMemo(() => {
    for (const { options } of itemOptions) {
      const option = options.find((x) => x.value === selectedItem?.id);
      if (option != null) {
        return option;
      }
    }
    return itemOptions[0].options[0];
  }, [selectedItem?.id, itemOptions]);

  const recipesProducingData = React.useMemo(
    () =>
      recipesProducing.map((recipe) =>
        createRecipeData(selectedItem?.id ?? "", recipe)
      ),
    [selectedItem?.id, recipesProducing]
  );

  const recipesForItemData = React.useMemo(
    () => createRecipesForItemData(selectedItem?.id ?? "", recipesForItem),
    [selectedItem?.id, recipesForItem]
  );

  const recipesForBuildingData = React.useMemo(
    () =>
      createRecipesForBuildingData(selectedItem?.id ?? "", recipesForBuilding),
    [selectedItem?.id, recipesForBuilding]
  );

  const milestonesData = React.useMemo(
    () => createMilestonesData(selectedItem?.id ?? "", milestones),
    [selectedItem?.id, milestones]
  );

  const researchesData = React.useMemo(
    () => createResearchesData(selectedItem?.id ?? "", researches),
    [selectedItem?.id, researches]
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
          onChange={onChangeItemId}
          isSearchable={true}
          className="mt-1 sm:text-sm"
        />
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
  );*/
}

export default IndexPage;
