#!/usr/bin/python
import logging
import yaml
from attrdict import AttrDict
from milestone_loader import load_milestones_from_wiki
from util import TMilestone, find_item, class_to_dict


def load_handy_milestones() -> list[AttrDict]:
    with open('handy/handy_milestones.yaml', encoding='utf-8') as fp:
        handy_milestones = yaml.safe_load(fp)

    return [AttrDict(milestone) for milestone in handy_milestones]

handy_milestones = load_handy_milestones()


def find_handy_milestone(id: str) -> TMilestone | None:
    for hmilestone in handy_milestones:
        if hmilestone.id.lower() == id.lower():
            return hmilestone
    return None


def save_milestones(milestones: any) -> None:
    with open('../backend/seeddata/milestones.yaml', 'w', encoding='utf-8') as fp:
        yaml.safe_dump(milestones, fp, allow_unicode=True, sort_keys=False)


def get_full_id(milestone: TMilestone) -> str:
    return f'Tier {milestone.tier} - {milestone.id}'


def get_link_anchor(hmilestone: any) -> str:
    link_anchor = hmilestone.get('link_anchor', None)
    if link_anchor is not None:
        return link_anchor

    link_anchor = hmilestone.id
    index = link_anchor.find(' - ')
    if index >= 0:
        link_anchor = link_anchor[index+3:]

    return link_anchor.strip() \
        .replace('.', '') \
        .replace(' ', '_')


def milestone_to_dict(milestone: TMilestone) -> dict | None:
    hmilestone = find_handy_milestone(get_full_id(milestone))
    if hmilestone is None:
        logging.error('"%s" is unknown milestone', milestone.id)
        return None

    for item in milestone.items:
        if find_item(item.id) is None:
            logging.error('"%s" is unknown item', item.id)

    return {
        'id': hmilestone.id,
        'name': hmilestone.name,
        'tier': milestone.tier,
        'time': milestone.time,
        'link_anchor': get_link_anchor(hmilestone),
        'items': class_to_dict(milestone.items),
    }


milestones = []
handy_milestone_set = set(hmilestone['id'] for hmilestone in handy_milestones)

for milestone in load_milestones_from_wiki():
    dic = milestone_to_dict(milestone)
    if dic is not None:
        milestones.append(dic)
        handy_milestone_set.discard(dic['id'])

for id in handy_milestone_set:
    logging.error('Error: Not handled milestone "%s".', id)

save_milestones(milestones)
