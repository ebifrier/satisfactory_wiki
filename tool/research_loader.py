#!/usr/bin/python
import datetime
import re
import requests
import lxml.html
from typing import Iterator
from util import to_id, normalize_value, TResearch, TItemAmount


def parse_researches(elem: any, category: tuple[str, str]) -> Iterator[TResearch]:
    children = elem.xpath('tbody/tr')
    research = None
    index = 1

    for child in children:
        if child.attrib.get('class') == 'firstRow':
            if research is not None:
                yield research

            research = parse_firstrow(child, category, index)
            index += 1
        elif research is not None:
            item = parse_otherrow(child)
            research.items.append(item)

    yield research


def parse_firstrow(elem: any, category: tuple, index: int) -> TResearch:
    elems = elem.xpath('td')

    sid = elems[1].xpath('a')[0].tail.strip()
    amount = normalize_value(elems[2].text)
    item_id = to_id(elems[2].xpath('span/a')[0].attrib['title'])

    t = datetime.datetime.strptime(elems[3].text, "%M:%S")
    time = t.minute * 60 + t.second

    link_anchor = f'{category[2]}{index:02}'
    items = [TItemAmount(item_id, amount)]
    return TResearch(sid, category, time, link_anchor, items)


def parse_otherrow(elem: any) -> TItemAmount:
    elems = elem.xpath('td')

    amount = normalize_value(elems[0].text)
    item_id = to_id(elems[0].xpath('span/a')[0].attrib['title'])

    return TItemAmount(item_id, amount)


categories = [
    ('Alien Megafauna', '異星の巨型動物', 'AlienOrganisms'),
    ('Alien Technology', '異星のテクノロジー', 'AlienTechnology'),
    ('Caterium', 'カテリウム', 'Caterium'),
    ('Mycelia', '菌糸', 'Mycelia'),
    ('Nutrients', '栄養素', 'Nutrients'),
    ('Power Slugs', 'パワー･スラッグ', 'PowerSlug'),
    ('Quartz', '石英', 'Quartz'),
    ('Sulfur', '硫黄', 'Sulfur'),
]

def load_researches_from_wiki() -> Iterator[TResearch]:
    res = requests.get(f'https://satisfactory.wiki.gg/wiki/MAM')
    html = re.sub(r'&\S*;', '', res.text)
    tree = lxml.html.fromstring(html)

    tables = tree.xpath('//table[contains(@class, "researchTable")]')
    for i, table in enumerate(tables):
        if i >= len(categories):
            continue
        cat = categories[i]
        for research in parse_researches(table, cat):
            yield research
