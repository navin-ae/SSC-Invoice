import { signal } from '@angular/core';

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  gst?: string;
  address?: string;
}

const STORAGE_KEY = 'ssc_customers_v1';

function read(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createCustomerStore() {
  const customers = signal<Customer[]>(read());

  function persist() {
    write(customers());
  }

  function add(c: Omit<Customer, 'id'>) {
    const id = Date.now().toString(36);
    customers.set([...customers(), { ...c, id }]);
    persist();
    return id;
  }

  function update(id: string, patch: Partial<Customer>) {
    customers.set(customers().map(x => x.id === id ? { ...x, ...patch } : x));
    persist();
  }

  function remove(id: string) {
    customers.set(customers().filter(x => x.id !== id));
    persist();
  }

  function setAll(items: Customer[]) {
    customers.set(items);
    persist();
  }

  function clear() {
    customers.set([]);
    persist();
  }

  return { customers, add, update, remove, setAll, clear };
}

// singleton instance for app-wide usage
export const customerStore = createCustomerStore();
