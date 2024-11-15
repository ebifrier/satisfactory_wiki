#!/usr/bin/python
import re
import yaml
import lxml
from collections import namedtuple
from attrdict import AttrDict


TRecipeItem = namedtuple('TRecipeItem', ['id', 'amount', 'minute'])
TRecipe = namedtuple('TRecipe', ['id', 'buildings', 'production_times',
                                 'alternate', 'ingredients', 'products',
                                 'conditions'])
TItemAmount = namedtuple('TItemAmount', ['id', 'amount'])
TMilestone = namedtuple('TMilestone', ['id', 'tier', 'time', 'items'])
TResearch = namedtuple('TResearch', ['id', 'category', 'time', 'link_anchor', 'items'])


def to_id(word: str) -> str:
    word = re.sub(r'\s*[(]([.\d]+)\s*m[)]\s*$', r'_\1m', word)
    word = word.replace('\n', '')
    word = word.replace("™", '')
    word = word.replace(' ', '_')
    
    match word:
        case 'Straight_Catwalk':
            return 'Catwalk_Straight'
        case 'Tarp_Construction_Fence_(Tar)':
            return 'Tarp_Construction_Fence'
        case 'Road_Barrier_(Concrete)':
            return 'Road_Barrier'
        case 'Plasma_Spitter_Remains':
            return 'Spitter_Remains'
        case _:
            return word


def normalize_value(value: str) -> str:
    value = value.replace(r'sec', '')
    value = value.replace(r'/min', '')
    value = value.replace(r'×', '')
    value = value.replace(r',', '')
    value = value.replace(r' ', '')

    try:
        return int(value)
    except:
        return float(value)


def class_to_dict(obj: any) -> dict:
    def recurse_dict(dic: dict) -> dict:
        return {key: class_to_dict(value) for key, value in dic.items()}

    if isinstance(obj, list):
        return [class_to_dict(item) for item in obj]
    elif isinstance(obj, tuple) and hasattr(obj, '_fields'):
        return recurse_dict(obj._asdict())
    elif hasattr(obj, "__dict__"):
        return recurse_dict(obj.__dict__)
    else:
        return obj


def print_elem(elem: any) -> None:
    print(lxml.html.tostring(elem, pretty_print=True).decode('utf-8'))


def load_items() -> list[AttrDict]:
    with open('../backend/seeddata/items.yaml', encoding='utf-8') as fp:
        items = yaml.safe_load(fp)

    return [AttrDict(item) for item in items]

items = load_items()


def find_item(id: str) -> any:
    for item in items:
        if to_id(item.id.lower()) == to_id(id.lower()):
            return item
    return None


def load_buildings() -> list[AttrDict]:
    with open('../backend/seeddata/buildings.yaml', encoding='utf-8') as fp:
        buildings = yaml.safe_load(fp)

    return [AttrDict(building) for building in buildings]

buildings = load_buildings()


def find_building(id: str) -> any:
    for building in buildings:
        if to_id(building.id.lower()) == to_id(id.lower()):
            return building
    return None
