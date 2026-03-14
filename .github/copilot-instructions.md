## Copilot / AI Agent Instructions

**Application**: SSC Shop Billing System — A local-first retail billing & inventory management app with GST compliance (India-specific).

**Purpose**: Develop the Angular frontend for invoice creation, customer/product management, and backup/restore workflows.

**Quick commands**
- Dev: `npm start` (runs `ng serve`)
- Build: `npm run build` (`ng build`)
- Tests: `npm test` (Vitest + jsdom)

**Core Domain Model**
- **Customer**: id, name, contact, GST ID, address (stored in `customerStore`)
- **Product**: id, name, HSN code, GST rate (%), per-customer pricing (stored in `productStore`)
- **Invoice**: id, invoice#, date, customer, items[], subtotal, GST total, final total (stored in `invoiceStore`)

Data persists to localStorage keys: `ssc_customers_v1`, `ssc_products_v1`, `ssc_invoices_v1`.

**Features** (5 lazy-loaded routes)
1. `/` — **Billing**: select customer → add products → auto-calc GST → print/export PDF
2. `/customers` — CRUD customers
3. `/products` — Manage inventory with HSN & GST rates
4. `/invoices` — View/delete invoice history
5. `/config` — Backup/restore all data as JSON; embedded customer/product managers

**Architecture & conventions (must follow)**
- **Folder structure**: Features under `src/app/features/<feature>`; stores & utils under `src/app/core`; types under `src/app/types`.
- **Components**: Standalone + lazy-loaded routes via `loadComponent`.
- **State**: Signal-based stores in `core` (e.g., `createProductStore()` returns `{ products, add(), update(), remove(), clear() }`).
  - Stores wrap localStorage with JSON serialization; export singletons (`productStore`, `customerStore`, `invoiceStore`).
- **Templates**: Use `@if` / `@for` reactive control flow syntax.
- **Routing**: Lazy-load all features in [src/app/app.routes.ts](src/app/app.routes.ts).
- **Styles**: SCSS; keep component styles in component file.
- **TypeScript**: Strict mode; explicit types and small DTOs in `src/app/types`.
- **Formatting**: Prettier from `package.json` (Angular HTML parser for `*.html`).

**Testing**
- Unit tests: `ng test` (Vitest + jsdom). Test stores and components in isolation.
- E2E: not configured; skip e2e assumptions.

**Examples (follow these patterns)**
1. **Store pattern** (in `core/stores/`):
```ts
import { signal } from '@angular/core';

export interface Product { id: string; name: string; hsn?: string; gstRate?: number; prices: Record<string, number>; }

const STORAGE_KEY = 'ssc_products_v1';
export function createProductStore() {
  const products = signal<Product[]>(read());
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(products())); }
  function add(p: Omit<Product, 'id'>) { const id = Date.now().toString(36); products.set([...products(), { ...p, id }]); persist(); }
  function update(id: string, patch: Partial<Product>) { products.set(products().map(x => x.id === id ? { ...x, ...patch } : x)); persist(); }
  function remove(id: string) { products.set(products().filter(x => x.id !== id)); persist(); }
  return { products, add, update, remove };
}
export const productStore = createProductStore();
```

2. **Standalone component with signals**:
```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { productStore } from '../../core/stores/product-store';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent {
  products = productStore.products;
  addProduct(name: string) { productStore.add({ name, prices: {} }); }
}
```

**References**
- Angular Signals: https://angular.io/guide/signals
- Standalone components: https://angular.io/guide/standalone-components
- Router: https://angular.io/guide/router
- Control flow: https://angular.io/guide/control-flow

**Rules**: Follow architecture strictly. No global state outside stores. No imports from features into features. Ask before architectural changes.
