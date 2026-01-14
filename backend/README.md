SSC Billing backend (FastAPI)

Quick start (local):

1. Create a Python virtualenv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

2. Create Postgres database and set `DATABASE_URL` environment variable (or copy `.env.example` to `.env`).

3. Run the app:

```bash
uvicorn app.main:app --reload --port 8000
```

Endpoints:
- GET /api/products
- POST /api/products
- GET /api/customers
- POST /api/customers
- POST /api/invoices
- GET /api/backup
- POST /api/restore
- POST /api/products/bulk-import (multipart CSV)
