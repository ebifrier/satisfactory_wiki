import React, { ChangeEvent } from "react";
import { useDrag, useDrop } from "react-dnd";
import * as Icon from "@heroicons/react/24/outline";
import { useAppDispatch, TRecipe } from "@/index";
import { TRecipeSelection, actions } from "@/slices/compchartSlice";

export const ItemTypes = {
  RECIPE: "recipe",
};

//
// ドラッグ可能なレシピコンポーネント
//
export const DraggableRecipe: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    recipe: TRecipe;
    full: boolean;
    selIndex?: number;
  }
> = ({ recipe, full, selIndex, className, ...args }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drag] = useDrag(() => ({
    type: ItemTypes.RECIPE,
    item: { recipe, selIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);

  const getDisplayName = ({ name, ingredients, products }: TRecipe): string => {
    const ingList = ingredients
      .map((ing) => ing.item?.name)
      .filter((n) => n != null)
      .join(", ");
    const prodList = products
      .map((prod) => prod.item?.name)
      .filter((n) => n != null)
      .join(", ");
    return `${name} ［${ingList}］→［${prodList}］`;
  };

  return (
    <div
      ref={ref}
      className={`p-2 mb-1 border rounded-lg bg-white cursor-move shadow-md ${
        full ? "" : "inline-block"
      } ${className ?? ""}`}
      {...args}
    >
      {full ? getDisplayName(recipe) : recipe.name}
    </div>
  );
};

export const RecipeSelection: React.FC<{
  index: number;
  recipeSel: TRecipeSelection;
  hasDelete?: boolean;
}> = ({ index, recipeSel, hasDelete }) => {
  const dispatch = useAppDispatch();
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.RECIPE,
      drop: ({ recipe }: { recipe: TRecipe }, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        dispatch(actions.addRecipe({ index, recipe }));
      },
    }),
    [recipeSel]
  );
  drop(ref);

  const { recipes, name } = recipeSel ?? {};
  const handleName = React.useCallback(
    (ev: ChangeEvent<HTMLInputElement>) =>
      dispatch(
        actions.updateRecipeSel({
          index,
          recipeSel: { ...recipeSel, name: ev.target.value },
        })
      ),
    [dispatch, index, recipeSel]
  );

  return (
    <div
      ref={ref}
      className="p-2 mt-2 border-2 border-dashed border-gray-300 rounded-lg min-h-[100px] bg-gray-100"
    >
      <h2 className="flex mb-3">
        <p className="flex-none p-1 my-auto inline-block">名前:</p>
        <input
          type="text"
          value={name}
          onChange={handleName}
          className="ml-2 p-1 flex-1 font-semibold max-w-[20rem] focus:outline-gray-400 rounded-lg"
        />
        <p className="flex-none inline-block ml-auto">
          <button
            className="inline-block ml-1 size-6 align-middle text-blue-400"
            onClick={() => dispatch(actions.addRecipeSel({ index }))}
          >
            <Icon.ArrowUpOnSquareIcon />
          </button>
          <button
            className="inline-block ml-1 size-6 align-middle text-blue-400"
            onClick={() => dispatch(actions.addRecipeSel({ index: index + 1 }))}
          >
            <Icon.ArrowDownOnSquareIcon />
          </button>
          <button
            className="inline-block ml-1 size-6 align-middle text-red-400 disabled:text-gray-300"
            onClick={() => dispatch(actions.deleteRecipeSel({ index }))}
            disabled={hasDelete != null && !hasDelete}
          >
            <Icon.TrashIcon />
          </button>
        </p>
      </h2>
      {recipes == null || recipes.length === 0 ? (
        <p>レシピをここにドロップしてください</p>
      ) : (
        recipes.map((recipe) => (
          <DraggableRecipe
            key={recipe.id}
            recipe={recipe}
            full={false}
            selIndex={index}
            className="recipe-item"
          />
        ))
      )}
    </div>
  );
};
