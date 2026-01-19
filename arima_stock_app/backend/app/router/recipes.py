from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.db.models import Recipe, RecipeItem, Ingredient
from app.db.models.recipe_item import RecipeItemType
from app.db.models.recipe import RecipeType
from app.schema.recipe import RecipeCreate, RecipeItemCreate
from sqlalchemy.orm import joinedload
from app.schema.ingredient import IngredientCreate


router = APIRouter()


@router.get("/")
def list_recipes(db: Session = Depends(get_db)):
    recipes = (
    db.query(Recipe)
    .options(
        joinedload(Recipe.items)
        .joinedload(RecipeItem.ingredient)
    )
    .all()
)


    return [
        {
            "id": r.id,
            "name": r.name,
            "type": r.type.value,
            "yield_qty": r.yield_qty,
            "yield_unit": r.yield_unit,
            "items": [
                {
                    "id": i.id,
                    "type": i.item_type.value,
                    "ingredient_id": i.ingredient_id,
                    "ingredient_name": i.ingredient.name if i.item_type == RecipeItemType.ingredient else None,
                    "sub_recipe_id": i.sub_recipe_id,
                    "qty": i.qty_per_unit,
                    "unit": i.unit,
                }
                for i in r.items
            ],
        }
        for r in recipes
    ]


@router.post("/")
def create_recipe(payload: RecipeCreate, db: Session = Depends(get_db)):
    exists = db.query(Recipe).filter_by(name=payload.name).first()
    if exists:
        raise HTTPException(400, "Recipe already exists")

    if payload.type == "base":
        if payload.yield_qty is None or payload.yield_unit is None:
            raise HTTPException(400, "Base recipe must have yield")

    recipe = Recipe(
        name=payload.name,
        type=RecipeType[payload.type],
        yield_qty=payload.yield_qty,
        yield_unit=payload.yield_unit
    )

    db.add(recipe)
    db.commit()
    db.refresh(recipe)

    return {
        "id": recipe.id,
        "name": recipe.name,
        "type": recipe.type.value,
        "yield_qty": recipe.yield_qty,
        "yield_unit": recipe.yield_unit
    }


@router.post("/{recipe_id}/items")
def add_recipe_item(
    recipe_id: int,
    payload: RecipeItemCreate,
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).get(recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    # Validasi item type
    if payload.item_type == "ingredient":
        if not payload.ingredient_id:
            raise HTTPException(400, "ingredient_id required")

        ingredient = db.query(Ingredient).get(payload.ingredient_id)
        if not ingredient:
            raise HTTPException(404, "Ingredient not found")

        item = RecipeItem(
            recipe_id=recipe.id,
            item_type=RecipeItemType.ingredient,
            ingredient_id=payload.ingredient_id,
            qty_per_unit=payload.qty_per_unit,
            unit=payload.unit
        )

    else:  # recipe
        if not payload.sub_recipe_id:
            raise HTTPException(400, "sub_recipe_id required")

        if payload.sub_recipe_id == recipe_id:
            raise HTTPException(400, "Recipe cannot reference itself")

        sub_recipe = db.query(Recipe).get(payload.sub_recipe_id)
        if not sub_recipe:
            raise HTTPException(404, "Sub recipe not found")

        item = RecipeItem(
            recipe_id=recipe.id,
            item_type=RecipeItemType.recipe,
            sub_recipe_id=payload.sub_recipe_id,
            qty_per_unit=payload.qty_per_unit,
            unit=payload.unit
        )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "item_type": item.item_type.value,
        "qty": item.qty_per_unit,
        "unit": item.unit
    }

@router.get("/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).get(recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    return {
        "id": recipe.id,
        "name": recipe.name,
        "type": recipe.type.value,
        "yield_qty": recipe.yield_qty,
        "yield_unit": recipe.yield_unit,
        "items": [
            {
                "id": i.id,
                "type": i.item_type.value,
                "ingredient_id": i.ingredient_id,
                "sub_recipe_id": i.sub_recipe_id,
                "qty": i.qty_per_unit,
                "unit": i.unit
            }
            for i in recipe.items
        ]
    }

@router.post("/ingredients")
def create_ingredient(
    payload: IngredientCreate,
    db: Session = Depends(get_db)
):
    # Cegah duplikat
    exists = (
        db.query(Ingredient)
        .filter(Ingredient.name.ilike(payload.name))
        .first()
    )
    if exists:
        raise HTTPException(400, "Ingredient already exists")

    ingredient = Ingredient(
        name=payload.name.strip(),
        default_unit=payload.default_unit
    )

    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)

    return {
        "id": ingredient.id,
        "name": ingredient.name,
        "default_unit": ingredient.default_unit
    }
