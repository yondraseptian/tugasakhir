from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.users import User
from app.auth import verify_password, create_access_token, hash_password
from pydantic import BaseModel  

from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginData(BaseModel):
    email: str
    password: str

class RegisterData(BaseModel):
    name: str
    email: str
    password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name
    }

@router.post("/register")
def register(data: RegisterData, db: Session = Depends(get_db)):
    # cek email sudah dipakai
    if db.query(User).filter_by(email=data.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password)  # ✅ HASH
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }
