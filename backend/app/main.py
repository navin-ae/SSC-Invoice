from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
import importlib, os, sys

# Avoid importing SQLAlchemy Session at module import time to prevent hard crashes
# when SQLAlchemy is not compatible; use a placeholder for type annotations.
Session = object

# Robust import logic: try relative import first, then absolute package import, then adjust sys.path
try:
    from . import crud, models, schemas, database
except Exception as e_rel:
    tried = []
    # try absolute import using package name
    try:
        from backend import crud, models, schemas, database
    except Exception as e_abs:
        tried.append(str(e_abs))
        # attempt to add project root to sys.path and import again
        pkg_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
        project_root = os.path.dirname(pkg_dir)
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
        try:
            from backend import crud, models, schemas, database
        except Exception as e_final:
            # Determine whether SQLAlchemy was the root cause or an import context issue
            err_msg = str(e_final)
            if 'sqlalchemy' in err_msg.lower() or 'assertionerror' in err_msg.lower():
                raise RuntimeError(
                    "Failed to import SQLAlchemy or database modules. This often happens when the installed SQLAlchemy version is not compatible with your Python version (e.g., Python 3.14).\n"
                    "Please upgrade SQLAlchemy to a compatible version and reinstall dependencies, for example:\n"
                    "  pip install -U 'SQLAlchemy>=2.0.30'\n"
                    "Or run the backend in a supported Python version (e.g., 3.11 or 3.12).\n"
                    f"Original error: {err_msg}"
                )
            # Otherwise, provide a clear hint about import context (relative imports)
            raise RuntimeError(
                "Failed to import backend package modules. This usually happens when you run the file directly instead of as a package.\n"
                "Start the server from the project root and use the module path, for example:\n"
                "  uvicorn backend.app.main:app --reload --port 8000\n"
                f"Original error: {err_msg}"
            )

from typing import List
import csv
import io

app = FastAPI(title="SSC Billing Backend")

# CORS - allow local frontend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Initialize the database and create tables (ORM)
    try:
        from .database import Base, engine
        Base.metadata.create_all(bind=engine)
        print("Database initialized and tables created.")
    except Exception:
        print("Failed to initialize database metadata. Ensure SQLAlchemy is correctly installed and DATABASE_URL is valid.")

@app.get("/health")
def health():
    return {"status": "ok"}
# Customers
@app.get("/api/customers")
def list_customers(db: Session = Depends(database.get_db)):
    return crud.get_customers(db)

@app.post("/api/customers")
def add_customer(payload: schemas.CustomerCreate, db: Session = Depends(database.get_db)):
    print("Adding customer:", payload)
    return crud.create_customer(db, payload)

@app.put("/api/customers/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(customer_id: str, payload: schemas.CustomerCreate, db: Session = Depends(database.get_db)):
    payload.id = customer_id
    return crud.upsert_customer(db, payload)


@app.delete('/api/customers/{customer_id}')
def delete_customer(customer_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_customer(db, customer_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Customer not found')
    return {'ok': True}

# Products
@app.get("/api/products", response_model=List[schemas.ProductOut])
def list_products(db: Session = Depends(database.get_db)):
    return crud.get_products(db)

@app.post("/api/products", response_model=schemas.ProductOut)
def add_product(payload: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    return crud.create_product(db, payload)

@app.put("/api/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: str, payload: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    payload.id = product_id
    return crud.upsert_product(db, payload)

@app.delete("/api/products/{product_id}")
def delete_product(product_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_product(db, product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}

# Invoices
@app.get("/api/invoices", response_model=List[schemas.InvoiceOut])
def list_invoices(db: Session = Depends(database.get_db)):
    return crud.get_invoices(db)

@app.post("/api/invoices", response_model=schemas.InvoiceOut)
def save_invoice(payload: schemas.InvoiceCreate, db: Session = Depends(database.get_db)):
    return crud.create_invoice(db, payload)

@app.delete('/api/invoices/{invoice_id}')
def delete_invoice(invoice_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_invoice(db, invoice_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Invoice not found')
    return {'ok': True}

# Backup / Restore
@app.get("/api/backup")
def export_backup(db: Session = Depends(database.get_db)):
    customers = crud.get_customers(db)
    products = crud.get_products(db)
    invoices = crud.get_invoices(db)
    # The schemas for backup/restore are slightly different, so we manually create the dicts
    customers_out = [ { 'id': c.id, 'customer_name': c.customer_name, 'contact': c.contact, 'gst': c.gst } for c in customers ]
    products_out = [ { 'id': p.id, 'name': p.name, 'hsn': p.hsn, 'gstRate': p.gst_rate, 'prices': p.prices or {} } for p in products ]
    invoices_out = [ { 'id': i.id, 'invoiceNo': i.invoice_no, 'date': i.date, 'customerId': i.customer_id, 'customerName': i.customer_name, 'items': i.items, 'subtotal': i.subtotal, 'totalGst': i.total_gst, 'total': i.total } for i in invoices ]

    return {"exportedAt": __import__("datetime").datetime.utcnow().isoformat(), "data": {"customers": customers_out, "products": products_out, "invoices": invoices_out}}

@app.post("/api/restore")
def restore_backup(payload: schemas.BackupPayload, db: Session = Depends(database.get_db)):
    if payload.customers is not None:
        crud.clear_customers(db)
        for c_data in payload.customers:
            crud.create_customer(db, c_data)
            
    if payload.products is not None:
        crud.clear_products(db)
        for p_data in payload.products:
            # The incoming 'gstRate' needs to be mapped to 'gst_rate' for the schema
            p_dict = p_data.model_dump()
            if 'gstRate' in p_dict:
                p_dict['gst_rate'] = p_dict.pop('gstRate')
            p_schema = schemas.ProductCreate(**p_dict)
            crud.create_product(db, p_schema)

    if payload.invoices is not None:
        crud.clear_invoices(db)
        for inv_data in payload.invoices:
            crud.create_invoice(db, inv_data)
            
    return {"ok": True}

# CSV bulk-import endpoint (products)
@app.post("/api/products/bulk-import")
async def bulk_import_products(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    content = await file.read()
    try:
        text = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        created = []
        for row in reader:
            prices = {k.replace("price_", ""): float(v) for k, v in row.items() if k.startswith("price_") and v}
            # The incoming 'gstRate' from CSV needs to be handled
            gst_rate_val = None
            if row.get("gstRate"):
                try:
                    gst_rate_val = int(row["gstRate"])
                except (ValueError, TypeError):
                    pass # Keep it None if conversion fails
            
            p = schemas.ProductCreate(
                id=row.get("id") or None, 
                name=row["name"], 
                hsn=row.get("hsn"), 
                gst_rate=gst_rate_val, 
                prices=prices
            )
            created.append(crud.create_product(db, p))
        return {"count": len(created)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

