from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
# Default to SQLite billing.db in backend folder
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
default_db_file = os.path.join(backend_dir, 'billing.db')
normalized_path = default_db_file.replace('\\', '/')
default_sqlite_url = f"sqlite:///{normalized_path}"

raw_db_url = os.getenv('DATABASE_URL') or os.getenv('DATABASE')
if not raw_db_url or raw_db_url in ('sqlite:///./billing.db', 'sqlite:///billing.db'):
    DATABASE_URL = default_sqlite_url
else:
    DATABASE_URL = raw_db_url

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
