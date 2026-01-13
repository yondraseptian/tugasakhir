from sqlalchemy.orm import Session
from app.db.models import Recipe, RecipeItem, Ingredient
from app.db.models.recipe_item import RecipeItemType
from app.recipes import UNIT_CONVERSIONS

def expand_recipe_db(db: Session, recipe_name: str, qty: float, result: dict):
    recipe = db.query(Recipe).filter_by(name=recipe_name).first()

    # Base ingredient
    if not recipe:
        if recipe_name not in result:
            result[recipe_name] = {"qty": 0, "unit": "pcs"}
        result[recipe_name]["qty"] += qty
        return

    # qty = kebutuhan recipe ini (misal 30 ml)
    scale = qty / recipe.yield_qty

    for item in recipe.items:
        if item.item_type == RecipeItemType.ingredient:
            ing_name = item.ingredient.name
            ing_unit = item.unit

            used_qty = item.qty_per_unit * scale

            final_unit, factor = UNIT_CONVERSIONS.get(ing_unit, (ing_unit, 1))
            used_qty *= factor

            if ing_name not in result:
                result[ing_name] = {"qty": 0, "unit": final_unit}
            result[ing_name]["qty"] += used_qty

        elif item.item_type == RecipeItemType.recipe:
            sub_qty = item.qty_per_unit * scale
            expand_recipe_db(db, item.sub_recipe.name, sub_qty, result)
