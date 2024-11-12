import React, { ChangeEvent } from "react";
import { useDrag, useDrop } from "react-dnd";
import * as Icon from "@heroicons/react/24/outline";
import { TRecipe } from "@/types";
import { TRecipeSelection, RecipeSelectionUtil } from "./_compchartTypes";

export const ItemTypes = {
  RECIPE: "recipe",
};

// ドラッグ可能なレシピコンポーネント
export const DraggableRecipe: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { recipe: TRecipe; full: boolean }
> = ({ recipe, full, className, ...args }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drag] = useDrag(() => ({
    type: ItemTypes.RECIPE,
    item: { recipe },
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

export type SetRecipeSelType = (
  index: number,
  recipe?: TRecipeSelection,
  insert?: boolean
) => void;

export const RecipeSelection: React.FC<{
  index: number;
  recipeSel: TRecipeSelection;
  setRecipeSel: SetRecipeSelType;
  hasDelete?: boolean;
}> = ({ index, recipeSel, setRecipeSel, hasDelete }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.RECIPE,
      drop: ({ recipe }: { recipe: TRecipe }, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        setRecipeSel(index, RecipeSelectionUtil.addRecipe(recipeSel, recipe));
      },
    }),
    [recipeSel]
  );
  drop(ref);

  const { recipes, name } = recipeSel;
  const handleName = React.useCallback(
    (ev: ChangeEvent<HTMLInputElement>) =>
      setRecipeSel(index, { ...recipeSel, name: ev.target.value }),
    [index, recipeSel, setRecipeSel]
  );

  const handleInsertSelUp = React.useCallback(() => {
    setRecipeSel(index, { name: "", recipes: [] }, true);
  }, [index, setRecipeSel]);

  const handleInsertSelDown = React.useCallback(() => {
    setRecipeSel(index + 1, { name: "", recipes: [] }, true);
  }, [index, setRecipeSel]);

  const handleDeleteSel = React.useCallback(() => {
    setRecipeSel(index, undefined);
  }, [index, setRecipeSel]);

  return (
    <div
      ref={ref}
      className="p-2 mt-3 border-2 border-dashed rounded-lg min-h-[100px] bg-gray-100"
    >
      <h2 className="flex font-semibold mb-3">
        <p className="flex-none p-1 my-auto inline-block">名前:</p>
        <input
          type="text"
          value={name}
          onChange={handleName}
          className="ml-2 p-1 flex-1 max-w-[20rem] border border-gray-300 rounded-lg"
        />
        <p className="flex-none inline-block ml-auto">
          <button
            className="inline-block ml-1 size-6 align-middle text-blue-500"
            onClick={handleInsertSelUp}
          >
            <Icon.ArrowUpOnSquareIcon />
          </button>
          <button
            className="inline-block ml-1 size-6 align-middle text-blue-500"
            onClick={handleInsertSelDown}
          >
            <Icon.ArrowDownOnSquareIcon />
          </button>
          <button
            className="inline-block ml-1 size-6 align-middle text-red-500 disabled:text-gray-300"
            onClick={handleDeleteSel}
            disabled={hasDelete != null && !hasDelete}
          >
            <Icon.TrashIcon />
          </button>
        </p>
      </h2>
      {recipes.length === 0 ? (
        <p>レシピをここにドロップしてください</p>
      ) : (
        recipes.map((recipe) => (
          <DraggableRecipe
            key={recipe.id}
            recipe={recipe}
            full={false}
            className="recipe-item"
          />
        ))
      )}
    </div>
  );
};
