from sqlalchemy import (
    Integer, String, Enum, ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import enum

class RecipeItemType(enum.Enum):
    ingredient = "ingredient"
    recipe = "recipe"

class RecipeItem(Base):
    __tablename__ = "recipe_items"

    id: Mapped[int] = mapped_column(primary_key=True)

    recipe_id: Mapped[int] = mapped_column(
        ForeignKey("recipes.id", ondelete="CASCADE")
    )

    item_type: Mapped[RecipeItemType] = mapped_column(
        Enum(RecipeItemType, name="recipe_item_type")
    )

    # salah satu terisi tergantung item_type
    ingredient_id: Mapped[int | None] = mapped_column(
        ForeignKey("ingredients.id"),
        nullable=True
    )

    sub_recipe_id: Mapped[int | None] = mapped_column(
        ForeignKey("recipes.id"),
        nullable=True
    )

    qty_per_unit: Mapped[int] = mapped_column(Integer)
    unit: Mapped[str] = mapped_column(String(10))

    recipe = relationship(
        "Recipe",
        back_populates="items",
        foreign_keys=[recipe_id]
    )

    ingredient = relationship(
        "Ingredient",
        foreign_keys=[ingredient_id]
    )

    sub_recipe = relationship(
        "Recipe",
        foreign_keys=[sub_recipe_id]
    )
