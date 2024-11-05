
import os
from flask import Flask, request, render_template
from flask_migrate import Migrate
from sqlalchemy import asc, desc

from models import db, Item, Recipe, RecipeItem, Condition, ConditionItem
from seeddata import make_seeddata

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "satisfactory.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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


@app.route('/item')
def index():
    items = Item.query.all()
    selected_item_id = request.args.get('item_id')
    selected_item = Item.query.get(selected_item_id) if selected_item_id else None

    if not selected_item:
        data = {'items_by_category': items_by_category(items)}
        return render_template(
            component_name="index",
            props=data,
            view_data={},
        )

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

    data = {
        'selectedItem': selected_item.to_dict(),
        'itemsByCategory': items_by_category(items),
        'recipesProducing': [recipe.to_dict() for recipe in recipes_producing],
        'recipesForItem': [recipe.to_dict() for recipe in recipes_for_item],
        'recipesForBuilding': [recipe.to_dict() for recipe in recipes_for_building],
        'milestones': [milestone.to_dict() for milestone in milestones],
        'researches': [research.to_dict() for research in researches],
    }

    return render_template(
        component_name="index",
        props=data,
        view_data={},
    )


if __name__ == '__main__':
    app.run(debug=True)