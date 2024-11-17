import { TRecipe } from "@/index";
import { TRecipeSelection } from "@/features/compchartSlice";

export const getDefaultRecipeSels = (
  recipes: TRecipe[]
): TRecipeSelection[] => {
  const findRecipe = (recipeId: string): TRecipe => {
    return recipes.find((r) => r.id === recipeId)!;
  };
  const makeRecipes = (recipeIds: string[]): TRecipe[] => {
    return recipeIds.map((id) => findRecipe(id));
  };

  return [
    {
      name: "基本",
      recipes: makeRecipes([
        "Iron_Ingot",
        "Iron_Plate",
        "Iron_Rod",
        "Screw",
        "Reinforced_Iron_Plate",
      ]),
    },
    {
      name: "基本 & 鋳造ネジ",
      recipes: makeRecipes([
        "Cast_Screw",
        "Iron_Plate",
        "Reinforced_Iron_Plate",
      ]),
    },
    {
      name: "ネジ留め鉄板 & 鋳造ネジ",
      recipes: makeRecipes(["Bolted_Iron_Plate", "Cast_Screw", "Iron_Plate"]),
    },
    {
      name: "縫合鉄板 & 鉄のワイヤー",
      recipes: makeRecipes(["Iron_Plate", "Iron_Wire", "Stitched_Iron_Plate"]),
    },
    {
      name: "縫合鉄板",
      recipes: makeRecipes(["Iron_Plate", "Stitched_Iron_Plate", "Wire"]),
    },
    {
      name: "鋼鉄のネジ",
      recipes: makeRecipes([
        "Steel_Beam",
        "Steel_Screw",
        "Iron_Plate",
        "Reinforced_Iron_Plate",
      ]),
    },
    {
      name: "ネジ留め鉄板 & 鋼鉄のネジ",
      recipes: makeRecipes([
        "Steel_Beam",
        "Steel_Screw",
        "Iron_Plate",
        "Bolted_Iron_Plate",
      ]),
    },

    /*{
      name: "アルミ通常レシピ",
      recipes: makeRecipes([
        "Reanimated_SAM",
        "Ficsite_Ingot_(Aluminum)",
        "Alumina_Solution",
        "Aluminum_Scrap",
        "Aluminum_Ingot",
        "Silica",
      ]),
    },
    {
      name: "アルミ代替レシピ",
      recipes: makeRecipes([
        "Reanimated_SAM",
        "Ficsite_Ingot_(Aluminum)",
        "Pure_Aluminum_Ingot",
        "Electrode_Aluminum_Scrap",
        "Sloppy_Alumina",
        "Heavy_Oil_Residue",
        "Petroleum_Coke",
      ]),
    },
    {
      name: "カテリウム基本",
      recipes: makeRecipes([
        "Caterium_Ingot",
        "Reanimated_SAM",
        "Ficsite_Ingot_(Caterium)",
      ]),
    },
    {
      name: "純カテリウムのインゴット",
      recipes: makeRecipes([
        "Pure_Caterium_Ingot",
        "Reanimated_SAM",
        "Ficsite_Ingot_(Caterium)",
      ]),
    },
    {
      name: "鉱石変換+アルミ通常レシピ",
      recipes: makeRecipes([
        "Bauxite_(Caterium)",
        "Reanimated_SAM",
        "Ficsite_Ingot_(Aluminum)",
        "Alumina_Solution",
        "Aluminum_Scrap",
        "Aluminum_Ingot",
        "Silica",
      ]),
    },
    {
      name: "鉱石変換+アルミ代替レシピ",
      recipes: makeRecipes([
        "Bauxite_(Caterium)",
        "Reanimated_SAM",
        "Ficsite_Ingot_(Aluminum)",
        "Pure_Aluminum_Ingot",
        "Electrode_Aluminum_Scrap",
        "Sloppy_Alumina",
        "Heavy_Oil_Residue",
        "Petroleum_Coke",
      ]),
    },
    {
      name: "鉄基本",
      recipes: makeRecipes([
        "Iron_Ingot",
        "Reanimated_SAM",
        "Ficsite_Ingot_(Iron)",
      ]),
    },
    {
      name: "純鉄のインゴット",
      recipes: makeRecipes([
        "Pure_Iron_Ingot",
        "Reanimated_SAM",
        "Ficsite_Ingot_(Iron)",
      ]),
    },*/
  ];
};
