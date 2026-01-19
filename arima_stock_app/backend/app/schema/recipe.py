from pydantic import BaseModel, Field
from typing import Optional, Literal


class RecipeCreate(BaseModel):
    name: str = Field(..., min_length=2)
    type: Literal["menu", "base"]
    yield_qty: Optional[float] = Field(None, gt=0)
    yield_unit: Optional[str]


class RecipeItemCreate(BaseModel):
    item_type: Literal["ingredient", "recipe"]
    ingredient_id: Optional[int]
    sub_recipe_id: Optional[int]
    qty_per_unit: float = Field(..., gt=0)
    unit: str
