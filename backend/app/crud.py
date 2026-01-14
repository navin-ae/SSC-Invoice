import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas

# This function is now responsible for creating the tables
def init_db(engine):
    models.Base.metadata.create_all(bind=engine)

def get_customers(db: Session):
    return db.query(models.Customer).order_by(models.Customer.created_at.desc()).all()

def create_customer(db: Session, c: schemas.CustomerCreate):
    cid = c.id or (str(int(uuid.uuid4().int >> 64)))
    db_customer = models.Customer(
        id=cid,
        customer_name=c.customer_name,
        contact=c.contact,
        gst=c.gst
    )
    print("Creating customer with ID:", cid)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer
        

def upsert_customer(db: Session, c: schemas.CustomerCreate):
    if not c.id:
        return create_customer(db, c)
    
    db_customer = db.query(models.Customer).filter(models.Customer.id == c.id).first()

    if db_customer:
        db_customer.customer_name = c.customer_name
        db_customer.contact = c.contact
        db_customer.gst = c.gst
        db.commit()
        db.refresh(db_customer)
        return db_customer
    else:
        return create_customer(db, c)

def delete_customer(db: Session, customer_id: str):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return True
    return False

def get_products(db: Session):
    return db.query(models.Product).order_by(models.Product.created_at.desc()).all()

def create_product(db: Session, p: schemas.ProductCreate):
    pid = p.id or (str(int(uuid.uuid4().int >> 64)))
    db_product = models.Product(
        id=pid,
        name=p.name,
        hsn=p.hsn,
        gst_rate=p.gst_rate,
        prices=p.prices,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def upsert_product(db: Session, p: schemas.ProductCreate):
    if not p.id:
        return create_product(db, p)

    db_product = db.query(models.Product).filter(models.Product.id == p.id).first()

    if db_product:
        db_product.name = p.name
        db_product.hsn = p.hsn
        db_product.gst_rate = p.gst_rate
        db_product.prices = p.prices
        db.commit()
        db.refresh(db_product)
        return db_product
    else:
        return create_product(db, p)

def delete_product(db: Session, product_id: str):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return True
    return False

def get_invoices(db: Session):
    return db.query(models.Invoice).order_by(models.Invoice.created_at.desc()).all()

def create_invoice(db: Session, inv: schemas.InvoiceCreate):
    iid = inv.id or (str(int(uuid.uuid4().int >> 64)))
    
    # The items are Pydantic models, they need to be converted to dicts for the JSON field
    items_as_dicts = [item.model_dump() for item in inv.items]

    db_invoice = models.Invoice(
        id=iid,
        invoice_no=inv.invoiceNo,
        date=inv.date,
        customer_id=inv.customerId,
        customer_name=inv.customerName,
        subtotal=inv.subtotal,
        total_gst=inv.totalGst,
        total=inv.total,
        items=items_as_dicts
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: str):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice:
        db.delete(db_invoice)
        db.commit()
        return True
    return False

# Functions to clear all data from tables
def clear_customers(db: Session):
    db.query(models.Customer).delete()
    db.commit()

def clear_products(db: Session):
    db.query(models.Product).delete()
    db.commit()

def clear_invoices(db: Session):
    db.query(models.Invoice).delete()
    db.commit()

