
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy import orm, asc, desc

from models import db, Item, Building, Recipe, RecipeItem, Condition, ConditionItem
from seeddata import make_seeddata

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "satisfactory.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

    # 最初の実行時はシードデータを設定します。
    if not Item.query.first():
        db.session.add_all(make_seeddata(db))
        db.session.commit()


def items_by_category(items: list[Item]) -> list[tuple[str, list[dict]]]:
    result = []
    cat = None
    cat_items = None

    for item in items:
        if item.category != cat:
            cat = item.category
            cat_items = []
            result.append((cat, cat_items))

        cat_items.append(item.to_dict())

    return result


@app.get('/api/v1/items')
def items():
    items = Item.query.all()
    grouping = request.args.get('grouping', False)
    if grouping:
        items = items_by_category(items)
    else:
        items = [item.to_dict() for item in items]

    return jsonify(items)


@app.get('/api/v1/item/<string:item_id>/recipes/producing')
def recipes_producing(item_id: str):
    recipes = (Recipe.query.join(RecipeItem)
        .filter(RecipeItem.item_id == item_id)
        .filter(RecipeItem.role == 'product')
        .order_by(asc(Recipe.alternate), asc(Recipe.index))
        .all())
    recipes = sorted(recipes, key=lambda r: r.is_byproduct(item_id))

    return jsonify([recipe.to_dict() for recipe in recipes])


def get_using_recipes_query(item_id: str) -> tuple[orm.Query, type[RecipeItem]]:
    ingredient_alias = orm.aliased(RecipeItem)
    product_alias = orm.aliased(RecipeItem)
    recipes_query = (Recipe.query
        .join(ingredient_alias, Recipe.id == ingredient_alias.recipe_id)
        .filter(ingredient_alias.role == 'ingredient')
        .filter(ingredient_alias.item_id == item_id))
    return recipes_query, product_alias


@app.get('/api/v1/item/<string:item_id>/recipes/using_for_item')
def recipes_using_for_item(item_id: str):
    query, product_alias = get_using_recipes_query(item_id)
    recipes = (query
        .join(product_alias, Recipe.id == product_alias.recipe_id)
        .filter(product_alias.role == 'product')
        .join(Item, product_alias.item_id == Item.id)
        .order_by(asc(Recipe.index), desc(Item.kind))
        .all())

    return jsonify([recipe.to_dict() for recipe in recipes])


@app.get('/api/v1/item/<string:item_id>/recipes/using_for_building')
def recipes_using_for_building(item_id: str):
    query, product_alias = get_using_recipes_query(item_id)
    recipes = (query
        .join(product_alias, Recipe.id == product_alias.recipe_id)
        .filter(product_alias.role == 'product')
        .join(Building, product_alias.item_id == Building.id)
        .order_by(asc(Building.index))
        .all())

    return jsonify([recipe.to_dict() for recipe in recipes])


@app.get('/api/v1/item/<string:item_id>/milestones')
def milestones(item_id: str):
    milestones = (Condition.query
        .filter(Condition.kind == 'milestone')
        .join(ConditionItem, Condition.id == ConditionItem.condition_id)
        .filter(ConditionItem.item_id == item_id)
        .order_by(Condition.index)
        .all())
    
    return jsonify([milestone.to_dict() for milestone in milestones])


@app.get('/api/v1/item/<string:item_id>/researches')
def research(item_id: str):
    researches = (Condition.query
        .filter(Condition.kind == 'research')
        .join(ConditionItem, Condition.id == ConditionItem.condition_id)
        .filter(ConditionItem.item_id == item_id)
        .order_by(Condition.index)
        .all())

    return jsonify([research.to_dict() for research in researches])


if __name__ == '__main__':
    app.run(debug=True)
