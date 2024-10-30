#!/usr/bin/python
import logging
import yaml
from attrdict import AttrDict
from recipe_loader import load_recipe_from_wiki
from util import items, to_id, TRecipe, find_building, find_item, class_to_dict


def load_handy_recipes() -> list[AttrDict]:
    with open('handy/handy_recipes.yaml', encoding='utf-8') as fp:
        handy_recipes = yaml.safe_load(fp)

    with open('handy/handy_recipes_ore.yaml', encoding='utf-8') as fp:
        handy_recipes.extend(yaml.safe_load(fp))

    return [AttrDict(recipe) for recipe in handy_recipes]

handy_recipes = load_handy_recipes()


def find_handy_recipe(id: str) -> TRecipe | None:
    for hrecipe in handy_recipes:
        if to_id(hrecipe.id.lower()) == to_id(id.lower()):
            return hrecipe
    return None


def save_recipes(recipes: any) -> None:
    with open('../seeddata/recipes.yaml', 'w', encoding='utf-8') as fp:
        yaml.safe_dump(recipes, fp, allow_unicode=True, sort_keys=False)


def recipe_to_dict(recipe: TRecipe) -> dict | None:
    hrecipe = find_handy_recipe(recipe.id)
    if hrecipe is None:
        logging.error('"%s" is unknown recipe', recipe.id)
        return None

    if recipe.alternate != hrecipe.alternate:
        logging.error('"%s" is different alternate', recipe.id)

    for item in recipe.ingredients:
        if find_item(item.id) is None:
            logging.error('"%s" is unknown item', item.id)

    for item in recipe.products:
        if find_item(item.id) is None:
            logging.error('"%s" is unknown item', item.id)

    return {
        'id': to_id(hrecipe.id),
        'name': hrecipe.name,
        'jpwiki_id': to_id(getattr(hrecipe, 'jpwiki_id', recipe.id)),
        'link_anchor': hrecipe.link_anchor,
        'buildings': [to_id(id) for id in recipe.buildings],
        'production_times': recipe.production_times,
        'alternate': recipe.alternate,
        'ingredients': class_to_dict(recipe.ingredients),
        'products': class_to_dict(recipe.products),
        'conditions': recipe.conditions,
    }


def recipe_to_dict_building(recipe: TRecipe) -> dict | None:
    building = find_building(recipe.id)
    if building is None:
        logging.error('"%s" is unknown building', recipe.id)
        return None

    for item in recipe.ingredients:
        if find_item(item.id) is None:
            logging.error('"%s" is unknown item', item.id)

    for item in recipe.products:
        if find_building(item.id) is None:
            logging.error('"%s" is unknown building', item.id)

    return {
        'id': to_id(building.id),
        'name': building.name,
        'jpwiki_id': to_id(getattr(building, 'jpwiki_id', recipe.id)),
        'buildings': [to_id(id) for id in recipe.buildings],
        'production_times': recipe.production_times,
        'alternate': recipe.alternate,
        'ingredients': class_to_dict(recipe.ingredients),
        'products': class_to_dict(recipe.products),
        'conditions': recipe.conditions,
    }


def remove_duplicates_by_id(recipes: list[dict]) -> list[dict]:
    """レシピ名が重複する項目を削除し、すべての項目がユニークな名前を持つようにします。"""
    seen = set()
    unique_list = []

    for recipe in recipes:
        name = recipe['id']
        if name not in seen:
            unique_list.append(recipe)
            seen.add(name)

    return unique_list


recipes = []
building_recipes = {}
handy_recipe_set = set(to_id(recipe['id']) for recipe in handy_recipes)
pages = [item.id for item in items]
pages.append("Miner")

for page_id in pages:
    obtaining_recipes, usage_recipes = load_recipe_from_wiki(page_id)

    # 生産物用のレシピ
    for recipe in obtaining_recipes:
        dic = recipe_to_dict(recipe)
        if dic is not None:
            recipes.append(dic)
            handy_recipe_set.discard(dic['id'])

    # 建築物用のレシピ
    for recipe in usage_recipes:
        if recipe.buildings[0] != 'Build_Gun':
            continue

        dic = recipe_to_dict_building(recipe)
        if dic is not None:
            building_recipes[dic['id']] = dic
            handy_recipe_set.discard(dic['id'])

for recipe_id in handy_recipe_set:
    logging.error('Error: Not handled recipe "%s".', recipe_id)

recipes = remove_duplicates_by_id(recipes)
recipes.extend(building_recipes.values())
save_recipes(recipes)
