from sqlalchemy import Column, String, Integer, Float, JSON, DateTime
from sqlalchemy.sql import func
from .database import Base

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    contact = Column(String, nullable=True)
    gst = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hsn = Column(String, nullable=True)
    gst_rate = Column(Integer, nullable=True)
    prices = Column(JSON, nullable=True, server_default='{}')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True, index=True)
    invoice_no = Column(String, nullable=False)
    date = Column(String, nullable=True)
    customer_id = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    subtotal = Column(Float, nullable=False)
    total_gst = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    items = Column(JSON, nullable=False, server_default='[]')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
