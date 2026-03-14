import { signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  hsn?: string;
  gstRate?: number; // percentage, e.g., 18
  prices: Record<string, number>; // price per customer type
}

export function createProductStore() {
  const products = signal<Product[]>([]);

  function add(p: Omit<Product, 'id'>) {
    const id = Date.now().toString(36);
    products.set([...products(), { ...p, id }]);
    return id;
  }

  // For adding products received from backend API (preserves the backend ID)
  function addFromBackend(p: Product) {
    products.set([...products(), p]);
    return p.id;
  }

  function update(id: string, patch: Partial<Product>) {
    products.set(products().map(x => x.id === id ? { ...x, ...patch } : x));
  }

  function remove(id: string) {
    products.set(products().filter(x => x.id !== id));
  }

  function setAll(items: Product[]) {
    products.set(items);
  }

  function clear() {
    products.set([]);
  }

  return { products, add, addFromBackend, update, remove, setAll, clear };
}

// singleton store for convenience
export const productStore = createProductStore();
