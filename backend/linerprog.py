#!/usr/bin/python
import math
import pulp
from models import Item, Recipe


# 
def get_value(var: pulp.LpVariable, ndigits: int | None = None) -> float:
    value = var.value()
    if var.value() is None:
        value = 0
    if ndigits is not None:
        value = round(value, ndigits)
    return value


class ProductionPlanner:
    def __init__(self, recipe_ids: list[str], products: list[tuple[str, float]],
                 ingredients: list[str]):
        recipes = Recipe.query.filter(Recipe.id.in_(recipe_ids)).all()
        self.recipes_data = [(recipe, pulp.LpVariable(recipe.id, 0))
                             for recipe in recipes]
        self.products = products
        self.ingredients = ingredients
    
    def has_product(self, item_id: str) -> bool:
        for id, _ in self.products:
            if item_id == id:
                return True
        return False

    def total_products(self, id: str) -> pulp.LpAffineExpression:
        values = []
        for [recipe, p_recipe] in self.recipes_data:
            prod = recipe.find_product(id)
            if prod is not None:
                values.append(p_recipe * prod.minute)
        return pulp.lpSum(values)

    def total_ingredients(self, id: str) -> pulp.LpAffineExpression:
        values = []
        for[recipe, p_recipe] in self.recipes_data:
            ing = recipe.find_ingredient(id)
            if ing is not None:
                values.append(p_recipe * ing.minute)
        return pulp.lpSum(values)

    def _make_net_productions(self, prob: pulp.LpProblem) -> dict:
        net_productions = {}
        for item in Item.query.all():
            total_prod = self.total_products(item.id)
            total_ing = self.total_ingredients(item.id)
            net_prod = total_prod - total_ing
            net_productions[item.id] = net_prod

            if item.id in self.ingredients:
                prob += net_prod <= 0
            else:
                prob += net_prod >= 0

        for product_id, value in self.products:
            net_prod = net_productions.get(product_id, None)
            if net_prod is not None:
                prob += net_prod >= value

        return net_productions

    def _get_powers(self) -> tuple[pulp.LpAffineExpression, pulp.LpAffineExpression]:
        consums = []
        powers = []
        for [recipe, p_recipe] in self.recipes_data:
            power = recipe.get_power()
            if power is None:
                pass
            elif power >= 0:
                powers.append(power * p_recipe)
            else:
                consums.append(-power * p_recipe)
        return pulp.lpSum(consums), pulp.lpSum(powers)

    def solve(self) -> tuple[dict[str, float], float, float]:
        prob = pulp.LpProblem('ProductionPlanning', pulp.LpMinimize)
        net_productions = self._make_net_productions(prob)
        p_consum, p_power = self._get_powers()
        p_consum += net_productions['Water'] / 120 * 20

        # 生産対象ではない副産物(valueが0以上)の合計生産量が
        # 最小になるようにします。
        values = []
        for item_id, value in net_productions.items():
            if self.has_product(item_id):
                continue

            # up0には max(value, 0) の値が入ります。
            up0 = pulp.LpVariable(f'up0_{item_id}')
            prob += up0 >= value
            prob += up0 >= 0
            values.append(up0)
        prob += pulp.lpSum(values)

        solver = pulp.PULP_CBC_CMD(gapRel=1e-7)
        prob.solve(solver)

        net_result = {k: get_value(v, 3) for k,v in net_productions.items()
                      if math.fabs(get_value(v)) > 1e-4}
        return net_result, get_value(p_consum, 3), get_value(p_power, 3)

    def get_building_counts(self) -> dict[int]:
        result = {}
        for [recipe, p_recipe] in self.recipes_data:
            exist = result.get(recipe.building.id, 0)
            result[recipe.building.id] = exist + math.ceil(get_value(p_recipe))
        return result

    def get_recipe_counts(self) -> dict[float]:
        return {p_recipe.name: get_value(p_recipe, 3)
                for _, p_recipe in self.recipes_data}


# recipe_ids = ['Bauxite_(Caterium)', 'Reanimated_SAM', 'Ficsite_Ingot_(Aluminum)',
#               'Pure_Aluminum_Ingot', 'Electrode_Aluminum_Scrap', 'Sloppy_Alumina',
#               'Heavy_Oil_Residue', 'Petroleum_Coke']
# products = [('Ficsite_Ingot', 100), ('Bauxite', 0)]
# planner = ProductionPlanner(recipe_ids, products)
# net, power, consum = planner.solve()

# print(net, power, consum)
# print([(p_recipe, p_recipe.value()) for _, p_recipe in planner.recipes_data])
# print(planner.get_buildings())

# recipe_ids = ['Reanimated_SAM', 'Pure_Caterium_Ingot', 'Ficsite_Ingot_(Caterium)']
# products = [('Ficsite_Ingot', 100)]
# planner = ProductionPlanner(recipe_ids, products)
# net, power, consum = planner.solve()

# print(net, power, consum)
# print([(p_recipe, p_recipe.value()) for _, p_recipe in planner.recipes_data])
# print(planner.get_buildings())
