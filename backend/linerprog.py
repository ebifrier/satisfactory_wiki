#!/usr/bin/python
import math
import pulp
from models import Item, Recipe


# 
def get_value(var: pulp.LpVariable, ndigits: int | None = None) -> float:
    value = var.value()
    if value is None:
        return 0
    if ndigits is not None:
        return round(value, ndigits)
    return value


def calc_consum(power: float, count: float) -> float:
    """ダウンクロックを含めた、施設の電力計算を行います。"""
    EXP = 1.321928
    count_int = math.floor(count)
    count_decimal = count - count_int

    # オーバークロックを含めた消費電力は
    #   施設電力 * (percent / 100) ^ 1.321928
    # という式で計算されます。
    # これにより 200%OC時は約2.5倍、250%OC時は約3.6倍の消費電力となります。
    decimal_power = power * math.pow(count_decimal, EXP)
    return power * count_int + decimal_power


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
                prob += net_prod == value

        return net_productions

    def _get_powers(self) -> tuple[pulp.LpAffineExpression, pulp.LpAffineExpression]:
        consums = []
        powers = []
        for [recipe, p_recipe] in self.recipes_data:
            power = recipe.get_power()
            if power is None:
                pass
            elif power >= 0:
                powers.append(power * p_recipe.value())
            else:
                consums.append(calc_consum(-power, p_recipe.value()))
        return sum(consums), sum(powers)

    def solve(self) -> tuple[dict[str, float], float, float]:
        prob = pulp.LpProblem('ProductionPlanning', pulp.LpMinimize)
        net_productions = self._make_net_productions(prob)

        # 生産対象ではない副産物(valueが0以上)の合計生産量が
        # 最小になるようにします。
        values = []
        for item_id, value in net_productions.items():
            if self.has_product(item_id):
                continue

            # up0には max(生産量, 0) の値が入ります。
            up0 = pulp.LpVariable(f'up0_{item_id}')
            prob += up0 >= value
            prob += up0 >= 0
            values.append(up0)
        prob += pulp.lpSum(values)

        solver = pulp.PULP_CBC_CMD(gapRel=1e-7)
        prob.solve(solver)

        consum, power = self._get_powers()
        consum += calc_consum(20, -get_value(net_productions['Water']) / 120.0)
        net_result = {k: get_value(v, 3) for k,v in net_productions.items()
                      if math.fabs(get_value(v)) > 1e-4}
        return net_result, round(consum, 3), round(power, 3)

    def get_building_counts(self) -> dict[int]:
        result = {}
        for [recipe, p_recipe] in self.recipes_data:
            exist = result.get(recipe.building.id, 0)
            result[recipe.building.id] = exist + math.ceil(get_value(p_recipe))
        return result

    def get_recipe_counts(self) -> dict[float]:
        return {p_recipe.name: get_value(p_recipe, 3)
                for _, p_recipe in self.recipes_data}
