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

# CORS - allow local frontend and Wi-Fi devices on local store network
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Initialize the database and create tables (ORM)
    try:
        from .database import Base, engine
        from sqlalchemy import text
        Base.metadata.create_all(bind=engine)
        print("Database initialized and tables created.")
        # Ensure any newly added columns exist in existing database tables
        with engine.begin() as conn:
            for alter_sql in [
                "ALTER TABLE customers ADD COLUMN address VARCHAR",
                "ALTER TABLE customers ADD COLUMN group_id VARCHAR",
                "ALTER TABLE invoices ADD COLUMN customer_address VARCHAR",
            ]:
                try:
                    conn.execute(text(alter_sql))
                except Exception:
                    pass
    except Exception as e:
        print(f"Failed to initialize database metadata: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}

# Customer Groups
@app.get("/api/customer-groups", response_model=List[schemas.CustomerGroupOut])
def list_customer_groups(db: Session = Depends(database.get_db)):
    groups = crud.get_customer_groups(db)
    return [
        {
            "id": g.id,
            "name": g.name,
            "description": g.description,
        }
        for g in groups
    ]

@app.post("/api/customer-groups", response_model=schemas.CustomerGroupOut)
def add_customer_group(payload: schemas.CustomerGroupCreate, db: Session = Depends(database.get_db)):
    group = crud.create_customer_group(db, payload)
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
    }

@app.put("/api/customer-groups/{group_id}", response_model=schemas.CustomerGroupOut)
def update_customer_group(group_id: str, payload: schemas.CustomerGroupCreate, db: Session = Depends(database.get_db)):
    payload.id = group_id
    group = crud.upsert_customer_group(db, payload)
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
    }

@app.delete("/api/customer-groups/{group_id}")
def delete_customer_group(group_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_customer_group(db, group_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Customer group not found")
    return {"ok": True}

# Customers
@app.get("/api/customers", response_model=List[schemas.CustomerOut])
def list_customers(db: Session = Depends(database.get_db)):
    customers = crud.get_customers(db)
    return [
        {
            "id": c.id,
            "customer_name": c.customer_name,
            "contact": c.contact,
            "gst": c.gst,
            "address": c.address,
            "group_id": c.group_id,
        }
        for c in customers
    ]

@app.post("/api/customers", response_model=schemas.CustomerOut)
def add_customer(payload: schemas.CustomerCreate, db: Session = Depends(database.get_db)):
    print("Adding customer:", payload)
    customer = crud.create_customer(db, payload)
    return {
        "id": customer.id,
        "customer_name": customer.customer_name,
        "contact": customer.contact,
        "gst": customer.gst,
        "address": customer.address,
        "group_id": customer.group_id,
    }

@app.put("/api/customers/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(customer_id: str, payload: schemas.CustomerUpdate, db: Session = Depends(database.get_db)):
    customer = crud.upsert_customer(db, payload, customer_id=customer_id)
    return {
        "id": customer.id,
        "customer_name": customer.customer_name,
        "contact": customer.contact,
        "gst": customer.gst,
        "address": customer.address,
        "group_id": customer.group_id,
    }

@app.delete('/api/customers/{customer_id}')
def delete_customer(customer_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_customer(db, customer_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Customer not found')
    return {'ok': True}

# Products
@app.get("/api/products", response_model=List[schemas.ProductOut])
def list_products(db: Session = Depends(database.get_db)):
    products = crud.get_products(db)
    return [
        {
            "id": p.id,
            "name": p.name,
            "hsn": p.hsn,
            "gst_rate": p.gst_rate,
            "prices": p.prices or {},
        }
        for p in products
    ]

@app.post("/api/products", response_model=schemas.ProductOut)
def add_product(payload: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    product = crud.create_product(db, payload)
    return {
        "id": product.id,
        "name": product.name,
        "hsn": product.hsn,
        "gst_rate": product.gst_rate,
        "prices": product.prices or {},
    }

@app.put("/api/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: str, payload: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    payload.id = product_id
    product = crud.upsert_product(db, payload)
    return {
        "id": product.id,
        "name": product.name,
        "hsn": product.hsn,
        "gst_rate": product.gst_rate,
        "prices": product.prices or {},
    }

@app.delete("/api/products/{product_id}")
def delete_product(product_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_product(db, product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}

# Invoices
@app.get("/api/invoices", response_model=List[schemas.InvoiceOut])
def list_invoices(db: Session = Depends(database.get_db)):
    invoices = crud.get_invoices(db)
    return [
        {
            "id": inv.id,
            "invoiceNo": inv.invoice_no,
            "date": inv.date,
            "customerId": inv.customer_id,
            "customerName": inv.customer_name,
            "customerAddress": inv.customer_address,
            "items": inv.items,
            "subtotal": inv.subtotal,
            "totalGst": inv.total_gst,
            "total": inv.total,
        }
        for inv in invoices
    ]

@app.post("/api/invoices", response_model=schemas.InvoiceOut)
def save_invoice(payload: schemas.InvoiceCreate, db: Session = Depends(database.get_db)):
    invoice = crud.create_invoice(db, payload)
    return {
        "id": invoice.id,
        "invoiceNo": invoice.invoice_no,
        "date": invoice.date,
        "customerId": invoice.customer_id,
        "customerName": invoice.customer_name,
        "customerAddress": invoice.customer_address,
        "items": invoice.items,
        "subtotal": invoice.subtotal,
        "totalGst": invoice.total_gst,
        "total": invoice.total,
    }

@app.delete('/api/invoices/{invoice_id}')
def delete_invoice(invoice_id: str, db: Session = Depends(database.get_db)):
    ok = crud.delete_invoice(db, invoice_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Invoice not found')
    return {'ok': True}

# Backup / Restore
@app.get("/api/backup")
def export_backup(db: Session = Depends(database.get_db)):
    customer_groups = crud.get_customer_groups(db)
    customers = crud.get_customers(db)
    products = crud.get_products(db)
    invoices = crud.get_invoices(db)
    
    groups_out = [ { 'id': g.id, 'name': g.name, 'description': g.description } for g in customer_groups ]
    customers_out = [ { 'id': c.id, 'customer_name': c.customer_name, 'contact': c.contact, 'gst': c.gst, 'address': c.address, 'group_id': c.group_id } for c in customers ]
    products_out = [ { 'id': p.id, 'name': p.name, 'hsn': p.hsn, 'gstRate': p.gst_rate, 'prices': p.prices or {} } for p in products ]
    invoices_out = [ { 'id': i.id, 'invoiceNo': i.invoice_no, 'date': i.date, 'customerId': i.customer_id, 'customerName': i.customer_name, 'customerAddress': i.customer_address, 'items': i.items, 'subtotal': i.subtotal, 'totalGst': i.total_gst, 'total': i.total } for i in invoices ]

    return {"exportedAt": __import__("datetime").datetime.utcnow().isoformat(), "data": {"customerGroups": groups_out, "customers": customers_out, "products": products_out, "invoices": invoices_out}}

@app.post("/api/restore")
def restore_backup(payload: schemas.BackupPayload, db: Session = Depends(database.get_db)):
    if payload.customerGroups is not None:
        crud.clear_customer_groups(db)
        for g_data in payload.customerGroups:
            crud.create_customer_group(db, g_data)

    if payload.customers is not None:
        crud.clear_customers(db)
        for c_data in payload.customers:
            crud.create_customer(db, c_data)
            
    if payload.products is not None:
        crud.clear_products(db)
        for p_data in payload.products:
            p_dict = p_data.model_dump() if hasattr(p_data, 'model_dump') else p_data.dict()
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

