#!/usr/bin/python
import re
import sys
import requests
import lxml.html
import yaml
from collections import namedtuple
from typing import Iterator
from util import to_id, class_to_dict, print_elem

TBuilding = namedtuple('TBuilding', ['id', 'category', 'subcategory'])


def parse_buildings(elem: any) -> Iterator[TBuilding]:
    children = elem.xpath('tbody/tr[count(td) >= 3]')

    for child in children:
        tds = child.xpath('td')
        if len(tds) > 0:
            yield parse_building(tds[0])


def parse_building(elem: any) -> str:
    children = elem.xpath('a')
    if len(children) == 0:
        children = elem.xpath('img')
    if len(children) == 0:
        print_elem(elem)

    return children[0].tail.strip()


def load_building_from_wiki(page_name: str, category: str, subcategory: str) -> list[TBuilding]:
    res = requests.get(f'https://satisfactory.wiki.gg/wiki/{page_name}')
    html = re.sub(r'&\S*;', '', res.text)
    tree = lxml.html.fromstring(html)

    buildings = []

    tables = tree.xpath('//h2[span[@id="Types"]]/following::table[contains(@class, "wikitable")]')
    for table in tables:
        for building_id in parse_buildings(table):
            buildings.append(TBuilding(to_id(building_id), category, subcategory))

    return buildings


buildings = load_building_from_wiki('Walls', '建築資材', '接続')
buildings = [class_to_dict(obj) for obj in buildings]
yaml.safe_dump(buildings, sys.stdout, allow_unicode=True, sort_keys=False)
