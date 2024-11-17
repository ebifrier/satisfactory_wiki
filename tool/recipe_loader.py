#!/usr/bin/python
import re
import requests
import lxml.html
from typing import Iterator
from util import to_id, normalize_value, TRecipe, TRecipeItem


def normalize_condition_id(name: str) -> str:
    name = re.sub(r'\s*OR\s*$', '', name)
    name = re.sub(r'\s*AND\s*$', '', name)
    return name.strip()


def parse_recipes(elem: any) -> Iterator[TRecipe]:
    children = elem.xpath('tbody/tr[count(td) >= 5]')

    for child in children:
        yield parse_recipe(child.xpath('td'))


def parse_recipe(elems: any) -> TRecipe:
    id = to_id(elems[0].text)

    alternate_elems = elems[0].xpath('span[contains(@class, "recipe-alternate")]')
    alternate = len(alternate_elems) > 0

    # Craft Bench と Constructor など、複数の施設が含まれる可能性があります。
    building_pairs = list(parse_buildings(elems[2]))
    building_ids = [pair[0] for pair in building_pairs]
    production_times = [pair[1] for pair in building_pairs]
    power = building_pairs[0][2]

    # 設備などは分速がありません。
    has_minute = all(building_id != 'Build_Gun' for building_id in building_ids)
    ingredients = list(parse_recipe_items(elems[1], has_minute))
    products = list(parse_recipe_items(elems[3], has_minute))

    # TierやMAMの段階名を取得します。
    conds = list(parse_milestones(elems[4]))

    return TRecipe(id, building_ids, production_times, alternate,
                   ingredients, products, conds, power)


def parse_power(value: str) -> int:
    m = re.match(r'([\d,]+)\s*\-\s*([\d,]+)', value)
    if m:
        v1 = int(m[1].replace(',',''))
        v2 = int(m[2].replace(',',''))
        return (v1 + v2) // 2

    return int(value.replace(',',''))


def parse_buildings(building_root: any) -> Iterator[tuple[str, str, int]]:
    building_elems = building_root.xpath('div[@class="recipe-building"]')

    for elem in building_elems:
        building_id = to_id(elem[0].text)
        # if building is None:
        #     logging.error('Error: "%s" is the unknown building.', elem[0].text)
        #     raise Exception()

        power = None
        power_elem = elem.xpath('span[@class="recipe-energy"]')
        if len(power_elem) >= 1:
            power = parse_power(power_elem[0].text)

        span_elem = elem.xpath('span/img')
        if len(span_elem) >= 1:
            production_time = span_elem[0].tail
            production_time = normalize_value(production_time)
            yield (building_id, production_time, power)
            continue

        br_elem = elem.xpath('br')
        if len(br_elem) >= 1:
            production_time = br_elem[0].tail
            production_time = normalize_value(production_time)
            yield (building_id, production_time, power)
            continue

        yield (building_id, 0, power)


def parse_recipe_items(items_root: any, has_minute: bool) -> Iterator[TRecipeItem]:
    recipe_elems = items_root.xpath('div/div[@class="recipe-item"]')

    for elem in recipe_elems:
        id = elem.xpath('span[@class="item-name"]')[0].text
        id = to_id(id)

        amount = elem.xpath('span[@class="item-amount"]')[0].text
        amount = normalize_value(amount)

        if has_minute:
            minute = elem.xpath('span[@class="item-minute"]')[0].text
        else:
            minute = '0'
        minute = normalize_value(minute)

        yield TRecipeItem(id, amount, minute)


def parse_milestones(items_root: any) -> Iterator[str]:
    label = items_root.text
    if label and 'Onboarding' in label:
        yield label.strip()

    for tag in items_root.xpath('a'):
        prefix = normalize_condition_id(tag.text)
        postfix = normalize_condition_id(tag.tail)
        yield f'{prefix} {postfix}'


def load_recipe_from_wiki(item_name: str) -> tuple[list[TRecipe], list[TRecipe]]:
    res = requests.get(f'https://satisfactory.wiki.gg/wiki/{item_name}')
    html = re.sub(r'&\S*;', '', res.text)
    tree = lxml.html.fromstring(html)

    obtaining_recipes = []
    usage_recipes = []

    # このアイテムが使用されるレシピ一覧
    usage = tree.xpath('//h2[span[@id="Usage"]]/following::table[contains(@class, "recipetable")][1]')
    if len(usage) == 0:
        usage = tree.xpath('//h3[span[@id="Used_to_craft"]]/following::table[contains(@class, "recipetable")][1]')
    if len(usage) == 1:
        usage_recipes = list(parse_recipes(usage[0]))

    # このアイテムを作成するレシピ一覧
    obtaining = tree.xpath('//h2[span[@id="Obtaining"]]/following::table[contains(@class, "recipetable")][1]')
    if len(obtaining) == 0:
        obtaining = tree.xpath('//h3[span[@id="Crafting"]]/following::table[contains(@class, "recipetable")][1]')
    if len(obtaining) == 1 and obtaining != usage:
        obtaining_recipes = list(parse_recipes(obtaining[0]))

    return (obtaining_recipes, usage_recipes)
