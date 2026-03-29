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
  isCustom?: boolean; // true for ad-hoc items not in product list
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

function readInvoices(): Invoice[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistInvoices(invoices: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function createInvoiceStore() {
  const invoices = signal<Invoice[]>(readInvoices());

  function add(inv: Invoice) {
    const newInvoices = [inv, ...invoices()];
    invoices.set(newInvoices);
    persistInvoices(newInvoices);
  }

  function addFromBackend(inv: Invoice) {
    // preserve server-provided id and numbering
    const newInvoices = [inv, ...invoices()];
    invoices.set(newInvoices);
    persistInvoices(newInvoices);
  }

  function save(inv: Invoice) {
    const newInvoices = [inv, ...invoices()];
    invoices.set(newInvoices);
    persistInvoices(newInvoices);
  }

  function list() {
    return invoices();
  }

  function clear() {
    invoices.set([]);
    persistInvoices([]);
  }

  function setAll(items: Invoice[]) {
    invoices.set(items);
    persistInvoices(items);
  }

  function remove(id: string) {
    const newInvoices = invoices().filter(x => x.id !== id);
    invoices.set(newInvoices);
    persistInvoices(newInvoices);
  }

  return { invoices, add, addFromBackend, save, list, clear, setAll, remove };
}

export const invoiceStore = createInvoiceStore();
