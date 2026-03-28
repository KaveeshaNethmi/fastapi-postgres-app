from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import UserResponse, UserCreate
from app.database import get_db
from app.services import create_user_service, get_users_service, update_user_service, delete_user_service

router = APIRouter(prefix='/users', tags=['Users'])

@router.post('/', response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user_service(db, user)


@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return get_users_service(db)

@router.put("/{user_id}", response_model = UserResponse)
def update_user(user_id, user: UserCreate, db: Session = Depends(get_db)):
    updated = update_user_service(db, user_id, user)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted = delete_user_service(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User Deleted Successfully"}