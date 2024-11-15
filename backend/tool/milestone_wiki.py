import os
from typing import Iterator
from flask import Flask
from models import db, Recipe, Condition
from jpwiki import get_small_iconlink
from table import *

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "satisfactory.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True

db.init_app(app)


def main():
    conditions = (Condition.query
        .filter(Condition.kind == 'research')
        .filter(Condition.category == '異星のテクノロジー')
        .order_by(Condition.index)
        .all())

    def create_rows(cond: Condition, i: int) -> Iterator[TableRow]:
        recipes = (Recipe.query
            .filter(cond.id == Recipe.condition_id)
            .all())

        recipe_items = []
        if recipes:
            recipe = recipes[0]
            product = recipe.products[0]

            if product.item is not None:
                recipe_items.append(f"''・アイテムレシピ''")
                recipe_items.append(f'&br;　　')
                recipe_items.append(get_small_iconlink(product.item))
            elif product.as_building() is not None:
                recipe_items.append(f"''・建築解放''")
                recipe_items.append(f'&br;　　')
                recipe_items.append(get_small_iconlink(product.as_building()))

        bg = 'white' if i % 2 == 1 else 'ivory'
        columns = [
            f'BGCOLOR({bg}):CENTER:', '>',
            f'BGCOLOR({bg}):LEFT:', '>',
            f'BGCOLOR({bg}):RIGHT:',
            f'BGCOLOR({bg}):LEFT:'
        ]
        yield TableRow(columns, TABLE_FORMATTING)

        first = True
        for item in cond.items:
            link_anchor = f'&aname(AlienTechnology{i:02});' if first else ''
            columns = [
                f'{i}' if first else '~',
                cond.name if first else '~',
                TableColumn([link_anchor, get_small_iconlink(item.item)]),
                item.amount,
                '0:03' if first else '~',
                TableColumn(recipe_items) if first else '~',
            ]
            first = False
            yield TableRow(columns)

    rows = []
    for i, cond in enumerate(conditions):
        rows.extend(create_rows(cond, i + 1))
    data = TableData(rows)
    
    print(data.to_jpwiki())


with app.app_context():
    main()
