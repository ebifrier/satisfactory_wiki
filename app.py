
import os
from flask import Flask, render_template, request
from flask_migrate import Migrate
from flask_assets import Environment, Bundle
from sqlalchemy import asc, desc

from jpwiki import *
from models import db, Item, Recipe, RecipeItem, Condition, ConditionItem
from seeddata import make_seeddata

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "satisfactory.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True

db.init_app(app)
migrate = Migrate(app, db)

assets = Environment(app)
scss = Bundle('style.scss', filters='libsass', output='style.css')
assets.register('style_all', scss)

with app.app_context():
    scss.build()
    db.create_all()
    
    # 最初の実行時はシードデータを設定します。
    if not Item.query.first():
        db.session.add_all(make_seeddata(db))
        db.session.commit()


def items_by_category(items: list[Item]) -> list[tuple[str, list[Item]]]:
    result = []
    cat = None
    cat_items = None

    for item in items:
        if item.category != cat:
            cat = item.category
            cat_items = []
            result.append((cat, cat_items))

        cat_items.append(item)

    return result


@app.route('/item')
def item_select():
    items = Item.query.all()
    selected_item_id = request.args.get('item_id')
    selected_item = Item.query.get(selected_item_id) if selected_item_id else None

    if not selected_item:
        return render_template('item_detail.html',
                               items_by_category=items_by_category(items))

    recipes_producing = Recipe.query.join(RecipeItem) \
        .filter(RecipeItem.item_id == selected_item_id,
                RecipeItem.role == 'product') \
        .order_by(asc(Recipe.alternate), asc(Recipe.index)) \
        .all()
    recipes_producing = sorted(recipes_producing,
                               key=lambda recipe: recipe.is_byproduct(selected_item_id))

    recipes_using = (Recipe.query
        .join(RecipeItem)
        .filter(RecipeItem.item_id == selected_item_id,
                RecipeItem.role == 'ingredient')
        .order_by(Recipe.index)
        .all())

    milestones = (Condition.query
        .filter(Condition.kind == 'milestone')
        .join(ConditionItem, Condition.id == ConditionItem.condition_id)
        .filter(ConditionItem.item_id == selected_item_id)
        .order_by(Condition.index)
        .all())
    researches = (Condition.query
        .filter(Condition.kind == 'research')
        .join(ConditionItem, Condition.id == ConditionItem.condition_id)
        .filter(ConditionItem.item_id == selected_item_id)
        .order_by(Condition.index)
        .all())

    recipes_for_item = filter(lambda x: x.products[0].item is not None,
                              recipes_using)
    recipes_for_item = list(recipes_for_item)
    recipes_for_item = sorted(recipes_for_item,
                              key=lambda x: x.products[0].item.kind_name)

    recipes_for_building = filter(lambda x: x.products[0].as_building() is not None,
                                  recipes_using)
    recipes_for_building = sorted(recipes_for_building,
                                  key=lambda x: x.products[0].as_building().index)

    args = {
        'recipe_producing_table_datas': [create_recipe_producing_table_data(selected_item_id, recipe)
                                         for recipe in recipes_producing],
        'recipes_for_item_table_data': create_recipes_for_item_table_data(selected_item_id, recipes_for_item),
        'recipes_for_building_table_data': create_recipes_for_building_table_data(selected_item_id, recipes_for_building),
        'milestones_table_data': create_milestones_table_data(selected_item_id, milestones),
        'researches_table_data': create_researches_table_data(selected_item_id, researches),
    }

    return render_template('item_detail.html',
                           items_by_category=items_by_category(items),
                           selected_item=selected_item,
                           **args)


if __name__ == '__main__':
    app.run(debug=True)
