import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas

def init_db(engine):
    models.Base.metadata.create_all(bind=engine)

# Customer Groups
def get_customer_groups(db: Session):
    return db.query(models.CustomerGroup).order_by(models.CustomerGroup.created_at.asc()).all()

def create_customer_group(db: Session, g: schemas.CustomerGroupCreate):
    gid = g.id or (str(int(uuid.uuid4().int >> 64)))
    db_group = models.CustomerGroup(
        id=gid,
        name=g.name,
        description=g.description
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def upsert_customer_group(db: Session, g: schemas.CustomerGroupCreate):
    if not g.id:
        return create_customer_group(db, g)
    
    db_group = db.query(models.CustomerGroup).filter(models.CustomerGroup.id == g.id).first()
    if db_group:
        db_group.name = g.name
        db_group.description = g.description
        db.commit()
        db.refresh(db_group)
        return db_group
    else:
        return create_customer_group(db, g)

def delete_customer_group(db: Session, group_id: str):
    db_group = db.query(models.CustomerGroup).filter(models.CustomerGroup.id == group_id).first()
    if db_group:
        # Also disassociate any customers assigned to this group
        db.query(models.Customer).filter(models.Customer.group_id == group_id).update({models.Customer.group_id: None})
        db.delete(db_group)
        db.commit()
        return True
    return False

def clear_customer_groups(db: Session):
    db.query(models.CustomerGroup).delete()
    db.commit()

# Customers
def get_customers(db: Session):
    return db.query(models.Customer).order_by(models.Customer.created_at.desc()).all()

def create_customer(db: Session, c: schemas.CustomerCreate):
    cid = c.id or (str(int(uuid.uuid4().int >> 64)))
    db_customer = models.Customer(
        id=cid,
        customer_name=c.customer_name,
        contact=c.contact,
        gst=c.gst,
        address=c.address,
        group_id=c.group_id
    )
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
        if c.address is not None:
            db_customer.address = c.address
        if c.group_id is not None:
            db_customer.group_id = c.group_id
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

# Products
def get_products(db: Session):
    return db.query(models.Product).order_by(models.Product.created_at.desc()).all()

def create_product(db: Session, p: schemas.ProductCreate):
    pid = p.id or (str(int(uuid.uuid4().int >> 64)))
    db_product = models.Product(
        id=pid,
        name=p.name,
        hsn=p.hsn,
        gst_rate=p.gst_rate,
        prices=p.prices or {},
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
        db_product.prices = p.prices or {}
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

# Invoices
def get_invoices(db: Session):
    return db.query(models.Invoice).order_by(models.Invoice.created_at.desc()).all()

def get_next_invoice_number(db: Session) -> str:
    """Generate the next invoice number by incrementing a counter."""
    counter = db.query(models.InvoiceCounter).filter(
        models.InvoiceCounter.id == "default"
    ).first()
    
    if not counter:
        counter = models.InvoiceCounter(id="default", next_number=1)
        db.add(counter)
        db.flush()
    
    invoice_number = counter.next_number
    counter.next_number += 1
    db.commit()
    
    return f"INV-{invoice_number:06d}"

def create_invoice(db: Session, inv: schemas.InvoiceCreate):
    iid = inv.id or (str(int(uuid.uuid4().int >> 64)))
    
    # Generate invoice number if not provided or empty
    if inv.invoiceNo and inv.invoiceNo.strip():
        invoice_no = inv.invoiceNo.strip()
    else:
        invoice_no = get_next_invoice_number(db)
    
    # Convert invoice line items to plain data for JSON column
    items_as_dicts = []
    for item in inv.items:
        if hasattr(item, 'model_dump'):
            items_as_dicts.append(item.model_dump())
        elif hasattr(item, 'dict'):
            items_as_dicts.append(item.dict())
        elif isinstance(item, dict):
            items_as_dicts.append(item)
        else:
            items_as_dicts.append(item.__dict__)

    db_invoice = models.Invoice(
        id=iid,
        invoice_no=invoice_no,
        date=inv.date,
        customer_id=inv.customerId,
        customer_name=inv.customerName,
        customer_address=inv.customerAddress,
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

# Clear data tables
def clear_customers(db: Session):
    db.query(models.Customer).delete()
    db.commit()

def clear_products(db: Session):
    db.query(models.Product).delete()
    db.commit()

def clear_invoices(db: Session):
    db.query(models.Invoice).delete()
    counter = db.query(models.InvoiceCounter).filter(
        models.InvoiceCounter.id == "default"
    ).first()
    if counter:
        counter.next_number = 1
    else:
        db.add(models.InvoiceCounter(id="default", next_number=1))
    db.commit()
