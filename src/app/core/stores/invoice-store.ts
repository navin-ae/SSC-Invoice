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

export function createInvoiceStore() {
  const invoices = signal<Invoice[]>([]);

  function add(inv: Invoice) {
    invoices.set([inv, ...invoices()]);
  }

  function save(inv: Invoice) {
    invoices.set([inv, ...invoices()]);
  }

  function list() {
    return invoices();
  }

  function clear() {
    invoices.set([]);
  }

  function setAll(items: Invoice[]) {
    invoices.set(items);
  }

  function remove(id: string) {
    invoices.set(invoices().filter(x => x.id !== id));
  }

  return { invoices, add, save, list, clear, setAll, remove };
}

export const invoiceStore = createInvoiceStore();
