import { signal } from '@angular/core';

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  gst?: string;
  address?: string;
  groupId?: string; // customer group for pricing
}

const STORAGE_KEY = 'ssc_customers_v1';

function readCustomers(): Customer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function createCustomerStore() {
  const customers = signal<Customer[]>(readCustomers());

  function add(c: Omit<Customer, 'id'>) {
    const id = Date.now().toString(36);
    const newCustomers = [...customers(), { ...c, id }];
    customers.set(newCustomers);
    persistCustomers(newCustomers);
    return id;
  }

  // For adding customers received from backend API (preserves the backend ID)
  function addFromBackend(c: Customer) {
    const newCustomers = [...customers(), c];
    customers.set(newCustomers);
    persistCustomers(newCustomers);
    return c.id;
  }

  function update(id: string, patch: Partial<Customer>) {
    const newCustomers = customers().map(x => x.id === id ? { ...x, ...patch } : x);
    customers.set(newCustomers);
    persistCustomers(newCustomers);
  }

  function remove(id: string) {
    const newCustomers = customers().filter(x => x.id !== id);
    customers.set(newCustomers);
    persistCustomers(newCustomers);
  }

  function setAll(items: Customer[]) {
    customers.set(items);
    persistCustomers(items);
  }

  function clear() {
    customers.set([]);
    persistCustomers([]);
  }

  return { customers, add, addFromBackend, update, remove, setAll, clear };
}

// singleton instance for app-wide usage
export const customerStore = createCustomerStore();
