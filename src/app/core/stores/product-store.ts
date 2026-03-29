import { signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  hsn?: string;
  gstRate?: number; // percentage, e.g., 18
  prices: Record<string, number>; // price per group (previously was per customer)
}

const STORAGE_KEY = 'ssc_products_v1';

// Detect if data uses old format (customerId keys) vs new format (groupId keys)
function migrateProductData(product: any): Product {
  // If prices object has keys that look like customer IDs (timestamps), keep as-is for now
  // This will be handled by a one-time migration when customer groups are set up
  return product;
}

function readProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).map((p: any) => migrateProductData(p)) : [];
  } catch {
    return [];
  }
}

function persistProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function createProductStore() {
  const products = signal<Product[]>(readProducts());

  function add(p: Omit<Product, 'id'>) {
    const id = Date.now().toString(36);
    const newProducts = [...products(), { ...p, id }];
    products.set(newProducts);
    persistProducts(newProducts);
    return id;
  }

  // For adding products received from backend API (preserves the backend ID)
  function addFromBackend(p: Product) {
    const newProducts = [...products(), p];
    products.set(newProducts);
    persistProducts(newProducts);
    return p.id;
  }

  function update(id: string, patch: Partial<Product>) {
    const newProducts = products().map(x => x.id === id ? { ...x, ...patch } : x);
    products.set(newProducts);
    persistProducts(newProducts);
  }

  function remove(id: string) {
    const newProducts = products().filter(x => x.id !== id);
    products.set(newProducts);
    persistProducts(newProducts);
  }

  function setAll(items: Product[]) {
    products.set(items);
    persistProducts(items);
  }

  function clear() {
    products.set([]);
    persistProducts([]);
  }

  return { products, add, addFromBackend, update, remove, setAll, clear };
}

// singleton store for convenience
export const productStore = createProductStore();
