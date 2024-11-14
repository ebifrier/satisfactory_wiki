import datetime
import os
import sys
import yaml
from typing import Iterator
from flask_sqlalchemy import SQLAlchemy
from models import Building, Item, Recipe, RecipeItem, \
                   Condition, ConditionItem


def to_id(word: str) -> str:
    return word.strip().replace(' ', '_')


def to_int(value: str) -> int | None:
    if value is None:
        return None
    return int(value)


def make_seeddata(db: SQLAlchemy) -> Iterator[any]:
    for item in load_items():
        yield item

    for item in load_buildings():
        yield item

    for item in load_recipes():
        yield item

    yield Condition(id = 'Onboarding',
                    kind = 'onboarding',
                    index = 0,
                    name = '初期から開放済み',
                    link_anchor = '',
                    time = datetime.timedelta(seconds=0))

    for item in load_milestones():
        yield item

    for item in load_researches():
        yield item


def load_yaml(filename: str) -> any:
    dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(dir, 'seeddata', filename)

    with open(path, encoding='utf-8') as fp:
        return yaml.safe_load(fp)


def load_items() -> Iterator[Item]:
    """素材／装備品などの情報テーブルを読み込みます。"""
    items_data = load_yaml('items.yaml')

    for i, data in enumerate(items_data):
        item_id = to_id(data['id'])

        yield Item(id = item_id,
                   name = data['name'],
                   index = i,
                   kind = data['type'],
                   category = data['category'],
                   coupons = int(data.get('coupons', '0')),
                   wiki_id = data.get('wiki_id', item_id))


def load_buildings() -> Iterator[Building]:
    buildings_data = load_yaml('buildings.yaml')

    for i, data in enumerate(buildings_data):
        building_id = to_id(data['id'])

        yield Building(id = building_id,
                       name = data['name'],
                       index = i,
                       category = data['category'],
                       subcategory = data['subcategory'],
                       power = to_int(data.get('power', None)),
                       max_inputs = to_int(data.get('max_inputs', None)),
                       max_outputs = to_int(data.get('max_outputs', None)),
                       wiki_id = data.get('wiki_id', building_id))


def load_recipes() -> Iterator[Recipe]:
    recipes_data = load_yaml('recipes.yaml')
    #recipes_data.extend(load_yaml('recipes_burning.yaml'))

    for i, data in enumerate(recipes_data):
        recipe_id = to_id(data['id'])
        prefix = "代替: " if data['alternate'] else ""
        building2_id = None
        production_time2 = None

        if len(data['buildings']) > 1:
            if data['buildings'][1] != 'Equipment_Workshop' and \
               data['buildings'][1] != 'Craft_Bench':
                print(f'{data['buildings'][1]} is not CraftBench')
                sys.exit(1)
            building2_id = to_id(data['buildings'][1])
            production_time2 = float(data['production_times'][1])

        conditions = data.get('conditions', [])
        condition_id = None
        if conditions:
            condition_id = to_id(conditions[0])

        yield Recipe(id = recipe_id,
                     name = f"{prefix}{data['name']}",
                     index = i,
                     wiki_id = data.get('wiki_id', to_id(recipe_id)),
                     link_anchor = data.get('link_anchor', ''),
                     alternate = data['alternate'],
                     condition_id = condition_id,
                     building_id = to_id(data['buildings'][0]),
                     building2_id = building2_id,
                     production_time = float(data['production_times'][0]),
                     production_time2 = production_time2)

        for j, ing in enumerate(data['ingredients']):
            yield RecipeItem(recipe_id = recipe_id,
                             item_id = to_id(ing['id']),
                             role = 'ingredient',
                             index = j,
                             amount = float(ing['amount']),
                             minute = float(ing['minute']))

        for j, prod in enumerate(data['products']):
            yield RecipeItem(recipe_id = recipe_id,
                             item_id = to_id(prod['id']),
                             role = 'product',
                             index = j,
                             amount = float(prod['amount']),
                             minute = float(prod['minute']))


def load_milestones() -> Iterator[Condition]:
    milestones_data = load_yaml('milestones.yaml')

    for i, data in enumerate(milestones_data):
        condition_id = to_id(data['id'])

        yield Condition(id = condition_id,
                        kind = 'milestone',
                        index = i,
                        name = data['name'],
                        tier = int(data['tier']),
                        link_anchor = data.get('link_anchor', ''),
                        time = datetime.timedelta(seconds=data['time']))

        for j, item in enumerate(data['items']):
            yield ConditionItem(condition_id = condition_id,
                                item_id = to_id(item['id']),
                                index = j,
                                amount = int(item['amount']))


def load_researches() -> Iterator[Condition]:
    researches_data = load_yaml('researches.yaml')

    for i, data in enumerate(researches_data):
        condition_id = to_id(data['id'])

        yield Condition(id = condition_id,
                        kind = 'research',
                        index = i,
                        name = data['name'],
                        category = data['category'],
                        link_anchor = data.get('link_anchor', ''),
                        time = datetime.timedelta(seconds=data['time']))

        for j, item in enumerate(data['items']):
            yield ConditionItem(condition_id = condition_id,
                                item_id = to_id(item['id']),
                                index = j,
                                amount = int(item['amount']))
