//
// <Select>タグで使います。
//
export type Option = {
  value: string;
  label: string;
};

//
// Selectの選択項目をグルーピングします。
//
export type GroupOption = {
  label: string;
  options: Option[];
};

export const toId = (value: string): string => value.replace(/ /g, "_");
export const toDisplayId = (value: string): string => value.replace(/_/g, " ");

export type TBase = {
  id: string;
  name: string;
  index: number;
  wikiLink: string;
};

export type TItem = TBase & {
  wikiId: string;
  kind: string;
  category: string;
  coupons: number;
};

export class ItemUtil {
  static getFullName = ({ name, id }: TItem): string =>
    `${name} [${toDisplayId(id)}]`;

  static getKindName = ({ kind }: TItem): string => {
    switch (kind) {
      case "material":
        return "パーツ";
      case "equipment":
        return "装備品";
    }
    return "";
  };
}

export type TBuilding = TBase & {
  wikiId: string;
  category: string;
  subcategory: string;
  power?: number;
  area?: number;
  maxInputs?: number;
  maxOutputs?: number;
};

export class BuildingUtil {
  static getAreaSize = (buildingId: string): number => {
    switch (buildingId) {
      case "Build_Gun":
      case "Equipment_Workshop":
      case "Crafting_Bench":
      case "Equipment_Workshop":
        return 0;

      case "Smelter":
        return 45 / 64;
      case "Foundry":
        return 90 / 64;

      case "Constructor":
        return 78.21 / 64;
      case "Assembler":
        return 150 / 64;
      case "Manufacturer":
        return 360 / 64;
      case "Packager":
        return 64 / 64;
      case "Refinery":
        return 200 / 64;
      case "Blender":
        return 288 / 64;
      case "Particle_Accelerator":
        return 912 / 64;
      case "Quantum_Encoder":
        return 1056 / 64;
      case "Converter":
        return 256 / 64;

      case "Biomass_Burner":
        return 64 / 64;
      case "Coal-Powered_Generator":
        return 260 / 64;
      case "Fuel-Powered_Generator":
        return 400 / 64;
      case "Nuclear_Power_Plant":
        return 1548 / 64;
      case "Alien_Power_Augmenter":
        return 784 / 64;
    }

    throw new Error(`${buildingId} is unknown building`);
  };
}

export type TConditionItem = {
  conditionId: string;
  itemId: string;
  item?: string;
  index: number;
  amount: number;
};

export type TCondition = TBase & {
  kind: string;
  linkAnchor: string;
  time: number;
  tier?: number;
  category?: string;
  items: TConditionItem[];
};

export class ConditionUtil {
  static findItem = (
    condition: TCondition,
    itemId: string
  ): TConditionItem | null => {
    for (const item of condition.items) {
      if (item.itemId === itemId) {
        return item;
      }
    }
    return null;
  };
}

export type TRecipeItem = {
  recipeId: string;
  itemId: string;
  item?: TItem;
  index: number;
  amount: number;
  minute: number;
  building?: TBuilding;
};

export type TRecipe = TBase & {
  wikiId: string;
  linkAnchor: string;
  alternate: boolean;
  conditionId: string;
  condition?: TCondition;
  productionTime: number;
  productionTime2?: number;
  power?: number;
  buildingId: string;
  building: TBuilding;
  building2Id?: string;
  building2?: TBuilding;
  ingredients: TRecipeItem[];
  products: TRecipeItem[];
};

export class RecipeUtil {
  static getFullName = ({ name, id }: TRecipe): string =>
    `${name} [${toDisplayId(id)}]`;

  static isByproduct = (recipe: TRecipe, itemId: string): boolean =>
    recipe.products[0]?.itemId !== itemId;

  static bgColor = (recipe: TRecipe, itemId: string): string => {
    if (this.isByproduct(recipe, itemId)) {
      return "#eee";
    } else if (recipe.alternate) {
      return "#fff6f6";
    } else {
      return "#f6fff6";
    }
  };

  static findIngredient = (
    recipe: TRecipe,
    itemId: string
  ): TRecipeItem | null => {
    for (const ing of recipe.ingredients) {
      if (ing.itemId === itemId) {
        return ing;
      }
    }
    return null;
  };

  static findProduct = (
    recipe: TRecipe,
    itemId: string
  ): TRecipeItem | null => {
    for (const prod of recipe.products) {
      if (prod.itemId === itemId) {
        return prod;
      }
    }
    return null;
  };
}
