from __future__ import annotations
from typing import Optional, Dict, List
from datetime import datetime

from pydantic import BaseModel

class OrmBaseModel(BaseModel):
    class Config:
        orm_mode = True
        from_attributes = True

# Customer Groups
class CustomerGroupCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None

class CustomerGroupOut(OrmBaseModel):
    id: str
    name: str
    description: Optional[str] = None

# Customers
class CustomerCreate(BaseModel):
    id: Optional[str] = None
    customer_name: str
    contact: Optional[str] = None
    gst: Optional[str] = None
    address: Optional[str] = None
    group_id: Optional[str] = None

class CustomerOut(OrmBaseModel):
    id: str
    customer_name: str
    contact: Optional[str] = None
    gst: Optional[str] = None
    address: Optional[str] = None
    group_id: Optional[str] = None

# Products
class ProductCreate(BaseModel):
    id: Optional[str] = None
    name: str
    hsn: Optional[str] = None
    gst_rate: Optional[int] = None
    prices: Dict[str, float] = {}

class ProductOut(OrmBaseModel):
    id: str
    name: str
    hsn: Optional[str] = None
    gst_rate: Optional[int] = None
    prices: Dict[str, float] = {}

# Invoices
class InvoiceItem(BaseModel):
    id: str
    productId: str
    name: str
    hsn: Optional[str] = None
    qty: int
    rate: float
    gstRate: float
    amount: float
    isCustom: Optional[bool] = False

class InvoiceCreate(BaseModel):
    id: Optional[str] = None
    invoiceNo: Optional[str] = None
    date: Optional[str] = None
    customerId: Optional[str] = None
    customerName: Optional[str] = None
    customerAddress: Optional[str] = None
    items: List[InvoiceItem] = []
    subtotal: float = 0.0
    totalGst: float = 0.0
    total: float = 0.0

class InvoiceOut(OrmBaseModel):
    id: str
    invoiceNo: str
    date: Optional[str] = None
    customerId: Optional[str] = None
    customerName: Optional[str] = None
    customerAddress: Optional[str] = None
    items: List[InvoiceItem] = []
    subtotal: float = 0.0
    totalGst: float = 0.0
    total: float = 0.0

class BackupPayload(BaseModel):
    customerGroups: Optional[List[CustomerGroupCreate]] = None
    customers: Optional[List[CustomerCreate]] = None
    products: Optional[List[ProductCreate]] = None
    invoices: Optional[List[InvoiceCreate]] = None
