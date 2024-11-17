import React from "react";
import Select from "react-select";
import * as Icon from "@heroicons/react/24/outline";
import { useAppDispatch, Option, GroupOption, findSelectedItem } from "@/index";
import { actions } from "@/features/compchartSlice";

export const IngredientSelectTable: React.FC<{
  chartId: string;
  ingredients: string[];
  itemOptions?: GroupOption[];
}> = ({ chartId, ingredients, itemOptions }) => {
  const dispatch = useAppDispatch();
  const selectedOptions = React.useMemo(
    () =>
      ingredients.length > 0
        ? ingredients.map((ingId) => findSelectedItem(ingId, itemOptions))
        : [undefined],
    [ingredients, itemOptions]
  );

  return (
    <table className="table-fixed w-full">
      <thead>
        <tr>
          <td className="text-center">素材</td>
          <td className="text-center w-[6rem]">操作</td>
        </tr>
      </thead>
      <tbody>
        {selectedOptions.map((selectedOption, index) => (
          <tr key={`${index}-${selectedOption?.value}`}>
            <td>
              <Select<Option, false>
                options={itemOptions}
                value={selectedOption}
                onChange={(option) => {
                  const { value } = option ?? {};
                  if (value != null) {
                    const newList = ingredients.toSpliced(index, 1, value);
                    dispatch(
                      actions.setIngredients({ chartId, ingredients: newList })
                    );
                  }
                }}
                isSearchable={true}
                className="sm:text-sm"
              />
            </td>
            <td className="text-center">
              <button
                type="button"
                className="size-6 text-blue-400"
                title="上に新しい項目を追加"
                onClick={() => {
                  const newList = ingredients.toSpliced(index, 0, "");
                  dispatch(
                    actions.setIngredients({ chartId, ingredients: newList })
                  );
                }}
              >
                <Icon.ArrowUpOnSquareIcon />
              </button>
              <button
                type="button"
                className="size-6 text-blue-400"
                title="下に新しい項目を追加"
                onClick={() => {
                  const newList = ingredients.toSpliced(index + 1, 0, "");
                  dispatch(
                    actions.setIngredients({ chartId, ingredients: newList })
                  );
                }}
              >
                <Icon.ArrowDownOnSquareIcon />
              </button>
              <button
                type="button"
                disabled={ingredients == null || ingredients.length <= 1}
                className="size-6 text-red-500 disabled:text-gray-200"
                title="項目を削除"
                onClick={() => {
                  const newList = ingredients.toSpliced(index, 1);
                  dispatch(
                    actions.setIngredients({ chartId, ingredients: newList })
                  );
                }}
              >
                <Icon.TrashIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
