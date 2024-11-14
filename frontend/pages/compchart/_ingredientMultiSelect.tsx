import React from "react";
import Select, { GroupHeadingProps } from "react-select";
import { Option, GroupOption, useAppDispatch, findSelectedItem } from "@/index";
import { actions } from "@/slices/compchartSlice";

const CustomGroupHeading: React.FC<GroupHeadingProps<Option, true>> = ({
  data,
  children,
}) => {
  const dispatch = useAppDispatch();

  return (
    <div
      onClick={() =>
        dispatch(actions.operateIngredients({ options: data.options }))
      }
      className="font-bold py-2 px-4 bg-gray-100 cursor-pointer"
    >
      {children}
      <span className="float-right font-normal">(click to select all)</span>
    </div>
  );
};

const IngredientMultiSelect: React.FC<{
  ingredients?: string[];
  itemOptions?: GroupOption[];
}> = ({ ingredients, itemOptions }) => {
  const dispatch = useAppDispatch();

  const selectedOptions = React.useMemo(
    () =>
      ingredients
        ?.map((ing) => findSelectedItem(ing, itemOptions))
        ?.filter((opt) => opt != null),
    [ingredients, itemOptions]
  );

  return (
    <Select<Option, true>
      options={itemOptions}
      value={selectedOptions}
      onChange={(options, meta) =>
        dispatch(actions.operateIngredients({ options, meta }))
      }
      isMulti={true}
      isSearchable={true}
      closeMenuOnSelect={false}
      className="sm:text-sm"
      components={{
        GroupHeading: (props) => <CustomGroupHeading {...props} />,
      }}
    />
  );
};

export default IngredientMultiSelect;
