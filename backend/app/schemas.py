from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime

class CustomerCreate(BaseModel):
    id: Optional[str]
    customer_name: str
    contact: Optional[str] = None
    gst: Optional[str] = None

class CustomerOut(BaseModel):
    id: str
    customer_name: str
    contact: Optional[str] = None
    gst: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    id: Optional[str]
    name: str
    hsn: Optional[str] = None
    gst_rate: Optional[int] = None
    prices: Dict[str, float]

class ProductOut(BaseModel):
    id: str
    name: str
    hsn: Optional[str] = None
    gst_rate: Optional[int] = None
    prices: Dict[str, float]
    model_config = ConfigDict(from_attributes=True)

class InvoiceItem(BaseModel):
    id: str
    productId: str
    name: str
    hsn: Optional[str] = None
    qty: int
    rate: float
    gstRate: float
    amount: float

class InvoiceCreate(BaseModel):
    id: Optional[str]
    invoiceNo: str
    date: Optional[str]
    customerId: Optional[str]
    customerName: Optional[str]
    items: List[InvoiceItem]
    subtotal: float
    totalGst: float
    total: float

class InvoiceOut(BaseModel):
    id: str
    invoiceNo: str
    date: Optional[str]
    customerId: Optional[str]
    customerName: Optional[str]
    items: List[InvoiceItem]
    subtotal: float
    totalGst: float
    total: float
    model_config = ConfigDict(from_attributes=True)


class BackupPayload(BaseModel):
    customers: Optional[List[CustomerCreate]] = None
    products: Optional[List[ProductCreate]] = None
    invoices: Optional[List[InvoiceCreate]] = None
