import { signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  hsn?: string;
  gstRate?: number; // percentage, e.g., 18
  prices: Record<string, number>; // price per customer type
}

const STORAGE_KEY = 'ssc_products_v1';

function read(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createProductStore() {
  const products = signal<Product[]>(read());

  function persist() {
    write(products());
  }

  function add(p: Omit<Product, 'id'>) {
    const id = Date.now().toString(36);
    products.set([...products(), { ...p, id }]);
    persist();
    return id;
  }

  function update(id: string, patch: Partial<Product>) {
    products.set(products().map(x => x.id === id ? { ...x, ...patch } : x));
    persist();
  }

  function remove(id: string) {
    products.set(products().filter(x => x.id !== id));
    persist();
  }

  function setAll(items: Product[]) {
    products.set(items);
    persist();
  }

  function clear() {
    products.set([]);
    persist();
  }

  return { products, add, update, remove, setAll, clear };
}

// singleton store for convenience
export const productStore = createProductStore();
