import React, { ChangeEvent } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Tooltip } from "react-tooltip";
import * as Icon from "@heroicons/react/24/outline";
import { useAppDispatch, TRecipe, RecipeUtil } from "@/index";
import { TRecipeSelection, actions } from "@/features/compchartSlice";
import { validateRecipes } from "@/features/validationRecipe";

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
    errors?: string[];
  }
> = ({ recipe, full, selIndex, errors = [], className, ...args }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drag] = useDrag(() => ({
    type: ItemTypes.RECIPE,
    item: { recipe, selIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);

  const getRecipeArgs = ({ ingredients, products }: TRecipe): string => {
    const ingList = ingredients
      .map((ing) => ing.item?.name)
      .filter((n) => n != null)
      .join(", ");
    const prodList = products
      .map((prod) => prod.item?.name)
      .filter((n) => n != null)
      .join(", ");
    return `［${ingList}］→［${prodList}］`;
  };

  const tooltipContent = React.useMemo(() => {
    return (
      <>
        <div>{RecipeUtil.getFullName(recipe)}</div>
        <div className="ml-2 mt-1">{getRecipeArgs(recipe)}</div>
      </>
    );
  }, [recipe]);

  const getDisplayName = ({ name }: TRecipe): string => {
    return `${name} ${getRecipeArgs(recipe)}`;
  };
  const tooltipId = `recipe-${selIndex}-${recipe.id}`;

  return (
    <div
      ref={ref}
      data-tooltip-id={tooltipId}
      className={`p-2 mb-1 border rounded-lg cursor-move shadow-md ${
        full ? "" : "inline-block"
      } ${errors.length > 0 ? "bg-red-500 text-white" : "bg-white"} ${
        className ?? ""
      }`}
      {...args}
    >
      {full ? getDisplayName(recipe) : recipe.name}
      {!full ? (
        <Tooltip id={tooltipId} place="bottom" className="z-10">
          {tooltipContent}
          {errors.length > 0 ? (
            <div className="mt-2">
              エラー
              {errors.map((err, index) => (
                <p key={index}>{err}</p>
              ))}
            </div>
          ) : null}
        </Tooltip>
      ) : null}
    </div>
  );
};

//
// 選択したレシピリストと、その名前を表示します。
//
export const RecipeSelection: React.FC<{
  chartId: string;
  selIndex: number;
  recipeSel: TRecipeSelection;
  ingredients?: string[];
  hasDelete?: boolean;
}> = ({ chartId, selIndex, recipeSel, ingredients, hasDelete }) => {
  const dispatch = useAppDispatch();
  const ref = React.useRef<HTMLDivElement>(null);
  const { recipes, name } = recipeSel ?? {};

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.RECIPE,
      drop: ({ recipe }: { recipe: TRecipe }, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        dispatch(actions.addRecipe({ chartId, selIndex, recipe }));
      },
    }),
    [recipeSel]
  );
  drop(ref);

  const handleName = React.useCallback(
    (ev: ChangeEvent<HTMLInputElement>) =>
      dispatch(
        actions.updateRecipeSel({
          chartId,
          selIndex,
          recipeSel: { ...recipeSel, name: ev.target.value },
        })
      ),
    [dispatch, chartId, selIndex, recipeSel]
  );

  const handleAddUpRecipe = React.useCallback(
    () => dispatch(actions.addRecipeSel({ chartId, selIndex })),
    [dispatch, chartId, selIndex]
  );

  const handleAddDownRecipe = React.useCallback(
    () => dispatch(actions.addRecipeSel({ chartId, selIndex: selIndex + 1 })),
    [dispatch, chartId, selIndex]
  );

  const handleDeleteRecipe = React.useCallback(() => {
    if (confirm(`このレシピ編成を削除してもよろしいですか？`)) {
      dispatch(actions.deleteRecipeSel({ chartId, selIndex }));
    }
  }, [dispatch, chartId, selIndex]);

  const recipeErrors = React.useMemo(
    () =>
      ingredients != null ? validateRecipes(recipes, ingredients) : undefined,
    [recipes, ingredients]
  );

  return (
    <div
      ref={ref}
      className="p-2 mt-2 border-2 border-dashed border-gray-300 rounded-lg bg-gray-100"
    >
      <h2 className="flex mb-3">
        <p className="flex-none p-1 my-auto inline-block">{`#${
          selIndex + 1
        }`}</p>
        <input
          type="text"
          value={name}
          onChange={handleName}
          placeholder="名前"
          title="レシピ編成の名前"
          className="ml-2 p-1 flex-1 font-semibold min-w-[10rem] focus:outline-gray-400 rounded-lg"
        />
        <p className="flex-none inline-block ml-auto">
          <button
            type="button"
            className="inline-block ml-1 size-6 align-middle text-blue-400"
            title="上に新しいレシピ編成を追加"
            onClick={handleAddUpRecipe}
          >
            <Icon.ArrowUpOnSquareIcon />
          </button>
          <button
            type="button"
            className="inline-block ml-1 size-6 align-middle text-blue-400"
            title="下に新しいレシピ編成を追加"
            onClick={handleAddDownRecipe}
          >
            <Icon.ArrowDownOnSquareIcon />
          </button>
          <button
            type="button"
            className="inline-block ml-1 size-6 align-middle text-red-400 disabled:text-gray-300"
            title="レシピ編成を削除"
            onClick={handleDeleteRecipe}
            disabled={hasDelete != null && !hasDelete}
          >
            <Icon.TrashIcon />
          </button>
        </p>
      </h2>
      {recipes == null || recipes.length === 0 ? (
        <p>レシピをここにドロップしてください</p>
      ) : (
        recipes.map((recipe, index) => (
          <DraggableRecipe
            key={recipe.id}
            recipe={recipe}
            full={false}
            selIndex={selIndex}
            errors={recipeErrors?.[index]?.errors}
            className="recipe-item"
          />
        ))
      )}
    </div>
  );
};
