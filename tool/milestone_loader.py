#!/usr/bin/python
import datetime
import re
import requests
import lxml.html
from typing import Iterator
from util import to_id, normalize_value, TMilestone, TItemAmount


def parse_milestones(elem: any, tier: int) -> Iterator[TMilestone]:
    children = elem.xpath('tbody/tr')
    milestone = None

    for child in children:
        if child.attrib.get('class') == 'firstRow':
            if milestone is not None:
                yield milestone

            milestone = parse_firstrow(child, tier)
        elif milestone is not None:
            item = parse_otherrow(child)
            milestone.items.append(item)

    yield milestone


def parse_firstrow(elem: any, tier: int) -> TMilestone:
    elems = elem.xpath('td')

    mid = elems[1].xpath('a')[0].tail.strip()
    amount = normalize_value(elems[2].text)
    item_id = to_id(elems[2].xpath('span/a')[0].attrib['title'])

    t = datetime.datetime.strptime(elems[3].text, "%M:%S")
    time = t.minute * 60 + t.second

    items = [TItemAmount(item_id, amount)]
    return TMilestone(mid, tier, time, items)


def parse_otherrow(elem: any) -> TItemAmount:
    elems = elem.xpath('td')

    amount = normalize_value(elems[0].text)
    item_id = to_id(elems[0].xpath('span/a')[0].attrib['title'])

    return TItemAmount(item_id, amount)


def load_milestones_from_wiki() -> Iterator[TMilestone]:
    res = requests.get(f'https://satisfactory.wiki.gg/wiki/Milestones')
    html = re.sub(r'&\S*;', '', res.text)
    tree = lxml.html.fromstring(html)

    tables = tree.xpath('//table[contains(@class, "milestoneTable")]')
    for i, table in enumerate(tables):
        for milestone in parse_milestones(table, i):
            yield milestone
