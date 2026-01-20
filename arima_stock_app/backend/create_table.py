from app.db.session import engine
from app.db.base import Base

import app.db.models.users
import app.db.models.ingredient
import app.db.models.recipe
import app.db.models.recipe_item

Base.metadata.create_all(bind=engine)
print("Tabel berhasil dibuat")
