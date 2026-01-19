from pydantic import BaseModel, Field

class IngredientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    default_unit: str = Field(..., min_length=1, max_length=10)


class IngredientResponse(BaseModel):
    id: int
    name: str
    default_unit: str
