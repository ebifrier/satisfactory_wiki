#!/usr/bin/python
import logging
import yaml
from attrdict import AttrDict
from research_loader import load_researches_from_wiki
from util import TResearch, find_item, class_to_dict


def find_handy_researches() -> list[AttrDict]:
    with open('handy/handy_researches.yaml', encoding='utf-8') as fp:
        handy_researches = yaml.safe_load(fp)

    return [AttrDict(research) for research in handy_researches]

handy_researches = find_handy_researches()


def find_handy_research(id: str) -> TResearch | None:
    for hresearch in handy_researches:
        if hresearch.id.lower() == id.lower():
            return hresearch
    return None


def save_researches(researches: any) -> None:
    with open('../seeddata/researches.yaml', 'w', encoding='utf-8') as fp:
        yaml.safe_dump(researches, fp, allow_unicode=True, sort_keys=False)


def get_full_id(research: TResearch) -> str:
    return f'MAM {research.category[0]} Research - {research.id}'


def get_link_anchor(hresearch: any, research: TResearch) -> str:
    link_anchor = hresearch.get('link_anchor', None)
    if link_anchor is not None:
        return link_anchor

    return research.link_anchor


def research_to_dict(research: TResearch) -> dict | None:
    hresearch = find_handy_research(get_full_id(research))
    if hresearch is None:
        logging.error('"%s" is unknown research', research.id)
        return None

    for item in research.items:
        if find_item(item.id) is None:
            logging.error('"%s" is unknown item', item.id)

    return {
        'id': hresearch.id,
        'name': hresearch.name,
        'category': research.category[1],
        'time': research.time,
        'link_anchor': get_link_anchor(hresearch, research),
        'items': class_to_dict(research.items),
    }


researches = []
handy_research_set = set(hresearch['id'] for hresearch in handy_researches)

for research in load_researches_from_wiki():
    dic = research_to_dict(research)
    if dic is not None:
        researches.append(dic)
        handy_research_set.discard(dic['id'])

for id in handy_research_set:
    logging.error('Error: Not handled research "%s".', id)

save_researches(researches)
