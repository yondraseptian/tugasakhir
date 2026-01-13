from sqlalchemy import String, Enum, Column, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import enum

class RecipeType(enum.Enum):
    base = "base"
    menu = "menu"

class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    type: Mapped[RecipeType] = mapped_column(
        Enum(RecipeType, name="recipe_type"),
        default=RecipeType.menu
    )
    yield_qty = Column(Float, nullable=False)
    yield_unit = Column(String(10), nullable=False)

    items = relationship(
        "RecipeItem",
        back_populates="recipe",
        cascade="all, delete-orphan",
         foreign_keys="[RecipeItem.recipe_id]"
    )

    def __repr__(self):
        return f"<Recipe {self.name}>"
