from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 👈 add this
from app.routes import user_routes
from app.database import engine, Base

app = FastAPI()

# CREATE TABLES
Base.metadata.create_all(bind=engine)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],
)

# INCLUDE ROUTERS
app.include_router(user_routes.router)