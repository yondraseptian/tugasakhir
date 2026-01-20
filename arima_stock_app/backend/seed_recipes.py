from app.db.session import SessionLocal
from app.db.models import Ingredient, Recipe, RecipeItem
from app.db.models.recipe import RecipeType
from app.db.models.recipe_item import RecipeItemType
from app.db.models import User
from passlib.hash import bcrypt
from app.recipes import RECIPES


def calculate_yield(items):
    total_ml = 0
    total_g = 0

    for item in items:
        unit = item.get("unit", "pcs")
        qty = item["qty_per_unit"]

        if unit == "ml":
            total_ml += qty
        elif unit == "g":
            total_g += qty

    if total_ml > 0:
        return total_ml, "ml"
    elif total_g > 0:
        return total_g, "g"
    else:
        return 1, "pcs"


def seed_recipes():
    db = SessionLocal()

    try:
         # =========================
        # 0️⃣ Insert Default User
        # =========================
        user = db.query(User).filter_by(name="admin").first()
        if not user:
            user = User(
                name="admin",
                email="admin@localhost",
                password=bcrypt.hash("admin123")
            )
            db.add(user)
            db.flush()

        user_id = user.id
        
        # =========================
        # 1️⃣ Kumpulkan nama recipe & ingredient
        # =========================
        recipe_names = set(RECIPES.keys())
        ingredient_names = set()

        for items in RECIPES.values():
            for item in items:
                if item["ingredient"] not in recipe_names:
                    ingredient_names.add(item["ingredient"])

        # =========================
        # 2️⃣ Insert Ingredients
        # =========================
        ingredient_map = {}
        for name in ingredient_names:
            ing = db.query(Ingredient).filter_by(name=name).first()
            if not ing:
                ing = Ingredient(name=name, default_unit="pcs", user_id=user_id)
                db.add(ing)
                db.flush()
            ingredient_map[name] = ing

        # =========================
        # 3️⃣ Insert Recipes + Yield
        # =========================
        recipe_map = {}

        # deteksi base recipe
        used_as_subrecipe = set()
        for items in RECIPES.values():
            for item in items:
                if item["ingredient"] in recipe_names:
                    used_as_subrecipe.add(item["ingredient"])

        for recipe_name, items in RECIPES.items():
            recipe = db.query(Recipe).filter_by(name=recipe_name).first()
            if not recipe:
                if recipe_name in used_as_subrecipe:
                    yield_qty, yield_unit = calculate_yield(items)
                    recipe_type = RecipeType.base
                else:
                    yield_qty, yield_unit = 1, "pcs"
                    recipe_type = RecipeType.menu

                recipe = Recipe(
                    name=recipe_name,
                    type=recipe_type,
                    yield_qty=yield_qty,
                    yield_unit=yield_unit,
                    user_id=user_id
                )
                db.add(recipe)
                db.flush()

            recipe_map[recipe_name] = recipe

        # =========================
        # 4️⃣ Insert Recipe Items
        # =========================
        for recipe_name, items in RECIPES.items():
            recipe = recipe_map[recipe_name]

            for item in items:
                name = item["ingredient"]
                qty = item["qty_per_unit"]
                unit = item.get("unit", "pcs")

                if name in recipe_names:
                    db.add(RecipeItem(
                        recipe_id=recipe.id,
                        item_type=RecipeItemType.recipe,
                        sub_recipe_id=recipe_map[name].id,
                        qty_per_unit=qty,
                        unit=unit
                    ))
                else:
                    db.add(RecipeItem(
                        recipe_id=recipe.id,
                        item_type=RecipeItemType.ingredient,
                        ingredient_id=ingredient_map[name].id,
                        qty_per_unit=qty,
                        unit=unit
                    ))

        db.commit()
        print("✅ RECIPES seeded successfully")

    except Exception as e:
        db.rollback()
        print("❌ ERROR:", e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_recipes()
