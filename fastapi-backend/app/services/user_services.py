from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.orm import Session
from app.schemas import UserCreate
from app.models import User

# Helper to ensure columns exist
def ensure_columns_exist(db: Session):
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR;"))
        db.commit()
    except ProgrammingError:
        db.rollback()

# Create User service
def create_user_service(db: Session, user: UserCreate):
    # Make sure columns exist before adding a user
    ensure_columns_exist(db)
    
    db_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone if hasattr(User, 'phone') else None,
        address=user.address if hasattr(User, 'address') else None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Fetch Users service
def get_users_service(db: Session):
    # Ensure columns exist before querying
    ensure_columns_exist(db)

    users = db.query(User).all()
    result = []
    for user in users:
        
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": getattr(user, "phone", None), # Use getattr to safely return None if column doesn't exist
            "address": getattr(user, "address", None) # Use getattr to safely return None if column doesn't exist
        })
    return result

# Update User service
def update_user_service(db: Session, user_id: int, user: UserCreate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None

    update_data = user.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

# Delete User service
def delete_user_service(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True