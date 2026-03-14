import { signal } from '@angular/core';

export interface Customer {
  id: string;
  name: string;
  contact?: string;
  gst?: string;
  address?: string;
}

export function createCustomerStore() {
  const customers = signal<Customer[]>([]);

  function add(c: Omit<Customer, 'id'>) {
    const id = Date.now().toString(36);
    customers.set([...customers(), { ...c, id }]);
    return id;
  }

  // For adding customers received from backend API (preserves the backend ID)
  function addFromBackend(c: Customer) {
    customers.set([...customers(), c]);
    return c.id;
  }

  function update(id: string, patch: Partial<Customer>) {
    customers.set(customers().map(x => x.id === id ? { ...x, ...patch } : x));
  }

  function remove(id: string) {
    customers.set(customers().filter(x => x.id !== id));
  }

  function setAll(items: Customer[]) {
    customers.set(items);
  }

  function clear() {
    customers.set([]);
  }

  return { customers, add, addFromBackend, update, remove, setAll, clear };
}

// singleton instance for app-wide usage
export const customerStore = createCustomerStore();
