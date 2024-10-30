#!/usr/bin/python
from models import Building, Item, Recipe, Condition
from table import *


def get_imageref(jpwiki_id: str, size: int = 20) -> ImageTag:
    return ImageTag(f'{jpwiki_id}.png', size)


def get_link(label: str, link: str) -> LinkTag:
    return LinkTag(label, link)


def get_iconlink(label: str, link: str, *,
                 jpwiki_id: str = None, imageref: str = None,
                 size: int = 20) -> LinkTag:
    if imageref is None:
        imageref = get_imageref(jpwiki_id, size)

    return LinkTag(label, link, imageref)


def get_small_iconlink(item: Recipe | Building | Item) -> LinkTag:
    return get_iconlink(item.name, item.jpwiki_link, jpwiki_id=item.jpwiki_id)


def get_condition_link(recipe: Recipe) -> LinkTag | str:
    if recipe.alternate:
        return LinkTag('ハードドライブ', '代替レシピ', pre='分析[ ', post=' ]')

    cond = recipe.condition
    if not cond:
        return ''

    match cond.kind:
        case 'onboarding':
            return f'[ 初期から開放済み ]'
        case 'milestone':
            return LinkTag(f'ティア{cond.tier}:{cond.name}', cond.jpwiki_link,
                           pre='マイルストーン[ ', post=' ]')
        case 'research':
            return LinkTag(f'{cond.category}:{cond.name}', cond.jpwiki_link,
                           pre='分析[ ', post=' ]')


def create_recipe_producing_table_data(item_id: str, recipe: Recipe) -> TableData:
    def get_building_link(building: Building) -> LinkTag:
        return get_iconlink(f'&br;{building.name}',
                            building.jpwiki_link,
                            jpwiki_id=building.jpwiki_id)

    building = recipe.building
    building2 = recipe.building2
    rows = []

    # ページ編集用の目印
    pre = ['//']
    pre.append(f'//	{"通常" if not recipe.alternate else "HD解析"}')
    if not recipe.is_byproduct(item_id):
        pre.append(f'#aname(Recipe_{recipe.link_anchor})')
    else:
        pre.append(f'// #aname(Recipe_)')

    # ヘッダ行の書式設定
    bg = recipe.bg_color(item_id)
    columns = ['>'] * 5 + [f'BGCOLOR({bg}):LEFT:']
    if building2:
        columns.append('>')
    columns.append(f'BGCOLOR({bg}):CENTER:')
    rows.append(TableRow(columns, TABLE_FORMATTING))

    # レシピ名やマイルストーンなどのヘッダ行を表示
    cond = get_condition_link(recipe)
    columns = ['>'] * 5 + [
        TableColumn([f"''{recipe.name}'' &br;", cond]),
        get_building_link(building),
    ]
    if building2:
        columns.append(get_building_link(building2))
    rows.append(TableRow(columns, TABLE_HEADER, bg))

    # テーブル中身の書式設定
    columns = [
        'LEFT:240', 'RIGHT:40', 'BGCOLOR(khaki):RIGHT:50',
        'LEFT:240', 'RIGHT:40', 'BGCOLOR(palegreen):RIGHT:50',
    ]
    if building2:
        columns.append('>')
    columns.append('CENTER:80')
    rows.append(TableRow(columns, TABLE_FORMATTING))

    for i in range(building.max_inputs):
        product = recipe.get_product(i)
        ingredient = recipe.get_ingredient(i)
        columns = [
            get_small_iconlink(ingredient) if ingredient else "　-",
            ingredient.amount_str if ingredient else "-",
            ingredient.minute_str if ingredient else "-",
            get_small_iconlink(product) if product else "~",
            product.amount_str if product else "~",
            product.minute_str if product else "~",
        ]

        if i == 0:
            columns.append(f'{recipe.production_time_str}秒')
            if building2:
                columns.append(f'{recipe.production_time2_str}click')
        else:
            columns.append('~')
            if building2:
                columns.append('~')

        rows.append(TableRow(columns))

    return TableData(rows, pre, ['#br'])


def create_recipes_for_item_table_data(item_id: str, recipes: list[Recipe]) -> TableData:
    """指定の素材を使うWIKI用のレシピテーブルを作成します。"""
    if not recipes:
        return TableData([])

    rows = []
    columns = ['CENTER:60', 'LEFT:200', 'LEFT:240', 'RIGHT:30', 'RIGHT:40', 'RIGHT:30']
    rows.append(TableRow(columns, TABLE_FORMATTING))

    columns = [
        'BGCOLOR(Gold):CENTER:種類',
        'BGCOLOR(Gold):CENTER:レシピ名',
        'BGCOLOR(Gold):CENTER:作成物',
        'BGCOLOR(Gold):CENTER:消費&br;個数',
        'BGCOLOR(Gold):CENTER:消費&br;速度',
        'BGCOLOR(Gold):CENTER:作成&br;個数',
    ]
    rows.append(TableRow(columns, TABLE_HEADER))

    for recipe in recipes:
        ingredient = recipe.find_ingredient(item_id)
        product = recipe.products[0]
        is_manual = recipe.building.is_manual

        columns = [
            product.item.kind_name,
            get_link(recipe.name, recipe.jpwiki_link),
            get_small_iconlink(product),
            ingredient.amount_str,
            ingredient.minute_str if not is_manual else '',
            product.amount_str,
        ]
        rows.append(TableRow(columns))

    return TableData(rows)


def create_recipes_for_building_table_data(item_id: str, recipes: list[Recipe]) -> TableData:
    """手動設置する設備のWIKI用テーブルを作成します。"""
    if not recipes:
        return TableData([])

    rows = []
    columns = ['CENTER:120', 'CENTER:120', 'LEFT:240', 'RIGHT:30']
    rows.append(TableRow(columns, TABLE_FORMATTING))

    columns = [
        'BGCOLOR(Gold):CENTER:大分類',
        'BGCOLOR(Gold):CENTER:小分類',
        'BGCOLOR(Gold):CENTER:作成物',
        'BGCOLOR(Gold):CENTER:消費&br;個数',
    ]
    rows.append(TableRow(columns, TABLE_HEADER))

    rows_dict = {}
    for recipe in recipes:
        ingredient = recipe.find_ingredient(item_id)
        product = recipe.products[0].as_building()
        columns = [
            product.category,
            product.subcategory,
            get_small_iconlink(product),
            ingredient.amount_str,
        ]
        rows_dict[product.index] = TableRow(columns)

    sorted_rows = sorted(list(rows_dict.items()), key=lambda x: x[0])
    return TableData(rows + [row for _, row in sorted_rows])


def create_milestones_table_data(item_id: str, milestones: list[Condition]) -> TableData:
    """そのアイテムを使うマイルストーンのWIKI用テーブルを作成します。"""
    if not milestones:
        return TableData([])

    rows = []
    columns = ['CENTER:120', 'LEFT:250', 'RIGHT:50']
    rows.append(TableRow(columns, TABLE_FORMATTING))

    columns = [
        'BGCOLOR(Gold):CENTER:ティア',
        'BGCOLOR(Gold):CENTER:マイルストーン名',
        'BGCOLOR(Gold):CENTER:個数'
    ]
    rows.append(TableRow(columns, TABLE_HEADER))

    for milestone in milestones:
        item = milestone.find_item(item_id)
        columns = [
            f'ティア{milestone.tier}',
            get_link(milestone.name, milestone.jpwiki_link),
            str(item.amount),
        ]
        rows.append(TableRow(columns))

    return TableData(rows)


def create_researches_table_data(item_id: str, researches: list[Condition]) -> TableData:
    """そのアイテムを使う分析のWIKI用テーブルを作成します。"""
    if not researches:
        return TableData([])

    rows = []
    columns = ['CENTER:120', 'LEFT:250', 'RIGHT:50']
    rows.append(TableRow(columns, TABLE_FORMATTING))

    columns = [
        'BGCOLOR(Gold):CENTER:カテゴリ',
        'BGCOLOR(Gold):CENTER:名称',
        'BGCOLOR(Gold):CENTER:個数'
    ]
    rows.append(TableRow(columns, TABLE_HEADER))

    for research in researches:
        item = research.find_item(item_id)
        columns = [
            research.category,
            get_link(research.name, research.jpwiki_link),
            str(item.amount),
        ]
        rows.append(TableRow(columns))

    return TableData(rows)
