from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
# default to your Postgres URL when no env var is provided
DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('DATABASE') or 'postgresql://postgres:pgadmin@localhost:5432/shop_demo'

# If pg8000 is installed and the scheme is 'postgresql://', prefer 'postgresql+pg8000://' so SQLAlchemy uses the pure-Python driver
try:
    import importlib
    if DATABASE_URL.startswith('postgresql://') and importlib.util.find_spec('pg8000') is not None:
        # replace only the first occurrence
        DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+pg8000://', 1)
except Exception:
    pass

# create engine using DATABASE_URL (can be overridden by env)
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

# This will be the base class for all our models. That means that
# any model you create should inherit from this class.
# This will make your python class to act as a table in the database.
Base = declarative_base()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
