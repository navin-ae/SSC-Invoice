import { signal } from '@angular/core';

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  hsn?: string;
  qty: number;
  rate: number;
  gstRate: number;
  amount: number; // qty * rate
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId?: string;
  customerName?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalGst: number;
  total: number;
}

const STORAGE_KEY = 'ssc_invoices_v1';

function read(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createInvoiceStore() {
  const invoices = signal<Invoice[]>(read());

  function persist() {
    write(invoices());
  }

  function save(inv: Invoice) {
    invoices.set([inv, ...invoices()]);
    persist();
  }

  function list() {
    return invoices();
  }

  function clear() {
    invoices.set([]);
    persist();
  }

  return { invoices, save, list, clear };
}

export const invoiceStore = createInvoiceStore();
