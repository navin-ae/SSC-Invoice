from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
# Default to SQLite billing.db in backend folder when no env var is provided
default_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'billing.db'))
# Format properly for Windows sqlite URL: sqlite:///C:/path/to/billing.db
normalized_path = default_db_path.replace('\\', '/')
default_sqlite_url = f"sqlite:///{normalized_path}"

DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('DATABASE') or default_sqlite_url

# If pg8000 is installed and the scheme is 'postgresql://', prefer 'postgresql+pg8000://' so SQLAlchemy uses the pure-Python driver
try:
    import importlib
    if DATABASE_URL.startswith('postgresql://') and importlib.util.find_spec('pg8000') is not None:
        # replace only the first occurrence
        DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+pg8000://', 1)
except Exception:
    pass

# create engine using DATABASE_URL (can be overridden by env)
engine_kwargs = {"future": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
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
