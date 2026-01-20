from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.db.models import Recipe, RecipeItem, Ingredient
from app.db.models.recipe_item import RecipeItemType
from app.db.models.recipe import RecipeType
from app.schema.recipe import RecipeCreate, RecipeItemCreate
from sqlalchemy.orm import joinedload
from app.schema.ingredient import IngredientCreate
from app.dependencies.auth import get_current_user
from app.db.models.users import User


router = APIRouter()


@router.get("/")
def list_recipes(db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)):
    recipes = (
    db.query(Recipe).filter_by(user_id=current_user.id)
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

                    # ingredient
                    "ingredient_id": i.ingredient_id,
                    "ingredient_name": (
                        i.ingredient.name
                        if i.item_type == RecipeItemType.ingredient
                        else None
                    ),

                    # sub recipe
                    "sub_recipe_id": i.sub_recipe_id,
                    "sub_recipe_name": (
                        i.sub_recipe.name
                        if i.item_type == RecipeItemType.recipe
                        else None
                    ),

                    "qty": i.qty_per_unit,
                    "unit": i.unit,
                }
                for i in r.items
            ],
        }
        for r in recipes
    ]


@router.post("/")
def create_recipe(payload: RecipeCreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    exists = db.query(Recipe).filter_by(
    name=payload.name.strip(),
    user_id=current_user.id
).first()
    if exists:
        raise HTTPException(400, "Recipe already exists")

    if payload.type == "base":
        if payload.yield_qty is None or payload.yield_unit is None:
            raise HTTPException(400, "Base recipe must have yield")

    recipe = Recipe(
        name=payload.name,
        type=RecipeType[payload.type],
        yield_qty=payload.yield_qty,
        yield_unit=payload.yield_unit,
        user_id=current_user.id
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
    db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user)
):
    recipe = db.query(Recipe).filter_by(id=recipe_id, user_id=current_user.id).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")

    # Validasi item type
    if payload.item_type == "ingredient":
        if not payload.ingredient_id:
            raise HTTPException(400, "ingredient_id required")

        ingredient = db.query(Ingredient).get(payload.ingredient_id)
        if not ingredient:
            raise HTTPException(404, "Ingredient not found or not belongs to user")

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

        sub_recipe = db.query(Recipe).filter_by(
        id=payload.sub_recipe_id,
        user_id=current_user.id
    ).first()
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

@router.get("/ingredients")
def list_ingredients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ingredients = (
        db.query(Ingredient)
        .filter(Ingredient.user_id == current_user.id)
        .order_by(Ingredient.name)
        .all()
    )

    return [
        {
            "id": i.id,
            "name": i.name,
            "default_unit": i.default_unit
        }
        for i in ingredients
    ]


@router.get("/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    recipe = db.query(Recipe).filter_by(id=recipe_id, user_id=current_user.id).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found or not belongs to user")

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exists = db.query(Ingredient).filter_by(
    name=payload.name.strip(),
    user_id=current_user.id
).first()
    if exists:
        raise HTTPException(400, "Ingredient already exists")

    ingredient = Ingredient(
    name=payload.name.strip(),
    default_unit=payload.default_unit,
    user_id=current_user.id
)

    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)

    return {
        "id": ingredient.id,
        "name": ingredient.name,
        "default_unit": ingredient.default_unit
    }

@router.delete("/items/{item_id}")
def delete_recipe_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ambil recipe item
    item = db.query(RecipeItem).filter_by(id=item_id).first()
    if not item:
        raise HTTPException(404, "Recipe item not found")

    # pastikan recipe milik user
    recipe = (
        db.query(Recipe)
        .filter(
            Recipe.id == item.recipe_id,
            Recipe.user_id == current_user.id
        )
        .first()
    )

    if not recipe:
        raise HTTPException(403, "You are not allowed to delete this item")

    db.delete(item)
    db.commit()

    return {
        "message": "Recipe item deleted successfully",
        "item_id": item_id
    }
