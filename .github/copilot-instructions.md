## Copilot / AI Agent Instructions

**Application**: SSC Shop Billing System — A database-backed retail billing & inventory management app with GST compliance (India-specific).

**Purpose**: Develop and maintain the Angular frontend for invoice creation, customer/product management, and backup/restore workflows that sync with backend database.

**Quick commands**
- Dev: `npm start` (runs `ng serve`)
- Build: `npm run build` (`ng build`)
- Tests: `npm test` (Vitest + jsdom)
- Backend: `python -m app.main` or `python run.bat` (FastAPI + SQLAlchemy)

**Core Domain Model**
- **CustomerGroup**: id, name, description — Groups for defining pricing tiers (stored in backend DB + `customerGroupStore`)
- **Customer**: id, name, contact, GST ID, address, groupId (stored in backend DB + `customerStore`)
- **Product**: id, name, HSN code, GST rate (%), prices per group (stored in backend DB + `productStore`)
- **Invoice**: id, invoice#, date, customer, items[], subtotal, GST total, final total (stored in backend DB + `invoiceStore`)

**Data Persistence**: All data persists to backend database via REST API. No localStorage used. Stores are in-memory caches synced from backend on app init.

**Features** (5 lazy-loaded routes)
1. `/` — **Billing**: select customer → add products (or custom items) → auto-calc GST → print/export PDF
2. `/customers` — CRUD customers with group assignment
3. `/products` — Manage inventory with HSN, GST rates, and group-based pricing
4. `/invoices` — View/delete invoice history (backend-persisted)
5. `/config` — Backup/restore to JSON file (syncs atomically with backend); embedded customer/product/group managers

**Architecture & conventions (must follow)**
- **Backend**: FastAPI + SQLAlchemy (SQLite or Postgres). Defines models, schemas, CRUD, REST endpoints. API base: `http://localhost:8000/api`
- **Frontend folder structure**: Features under `src/app/features/<feature>`; stores & utils under `src/app/core`; types under `src/app/types`.
- **Components**: Standalone + lazy-loaded routes via `loadComponent`.
- **State Management**: 
  - Stores (in `core/stores/`) are Signal-based caches: `{ items: Signal<Item[]>, add(), update(), remove(), setAll(), clear(), addFromBackend() }`
  - NO localStorage. Stores fetch from backend on app init and sync mutations through API services.
  - API Services (in `core/services/`) handle HTTP calls and store synchronization.
- **Data Flow**: App init → fetch CustomerGroups → Products → Customers → Invoices (in order) → populate stores → UI binds to signals
- **Templates**: Use `@if` / `@for` reactive control flow syntax.
- **Routing**: Lazy-load all features in [src/app/app.routes.ts](src/app/app.routes.ts).
- **Styles**: SCSS; keep component styles in component file.
- **TypeScript**: Strict mode; explicit types and small DTOs in `src/app/types`.
- **Formatting**: Prettier from `package.json` (Angular HTML parser for `*.html`).

**Testing**
- Unit tests: `ng test` (Vitest + jsdom). Test stores and components in isolation.
- E2E: not configured; skip e2e assumptions.

**Examples (follow these patterns)**
1. **Store pattern** (in `core/stores/`) — In-memory cache, NO localStorage:
```ts
import { signal } from '@angular/core';

export interface Product { id: string; name: string; hsn?: string; gstRate?: number; prices: Record<string, number>; }

export function createProductStore() {
  const products = signal<Product[]>([]); // Empty on init, fetched via API
  
  function add(p: Omit<Product, 'id'>) { 
    const id = Date.now().toString(36); 
    products.set([...products(), { ...p, id }]); 
    // API call happens in service, not here
  }
  
  function addFromBackend(p: Product) { 
    products.set([...products(), p]); // Called by API service after POST succeeds
  }
  
  function update(id: string, patch: Partial<Product>) { 
    products.set(products().map(x => x.id === id ? { ...x, ...patch } : x)); 
  }
  
  function remove(id: string) { 
    products.set(products().filter(x => x.id !== id)); 
  }
  
  function setAll(items: Product[]) { 
    products.set(items); // Called by API service on list() response
  }
  
  function clear() { 
    products.set([]); 
  }
  
  return { products, add, addFromBackend, update, remove, setAll, clear };
}
export const productStore = createProductStore();
```

2. **API Service pattern** (in `core/services/`) — Handles HTTP + store sync:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { Product, productStore } from '../stores/product-store';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.base}/products`;

  list(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((items) => productStore.setAll(items.map(item => ({...item, gstRate: item.gst_rate})))), // Transform & sync
      catchError((err) => { console.error(err); return throwError(() => err); })
    );
  }

  create(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<any>(this.apiUrl, {...}).pipe(
      tap((response) => productStore.addFromBackend(response)), // Sync backend response
      catchError((err) => { console.error(err); return throwError(() => err); })
    );
  }
}
```

3. **Standalone component with signals**:
```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { productStore } from '../../core/stores/product-store';
import { ProductApiService } from '../../core/services/product-api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent {
  private productApi = inject(ProductApiService);
  products = productStore.products;
  
  addProduct(name: string) { 
    // Dispatches HTTP POST via service, which syncs response to store
    this.productApi.create({ name, prices: {} }).subscribe();
  }
}
```

**References**
- Angular Signals: https://angular.io/guide/signals
- Standalone components: https://angular.io/guide/standalone-components
- Router: https://angular.io/guide/router
- Control flow: https://angular.io/guide/control-flow
- RxJS: https://rxjs.dev
- FastAPI: https://fastapi.tiangolo.com
- SQLAlchemy: https://docs.sqlalchemy.org

**Rules**: 
- Follow architecture strictly. 
- Stores are caches ONLY — no localStorage, no direct mutations without API.
- All data mutations must go through API services first, then update stores.
- No global state outside stores. 
- No imports from features into features. 
- API services own store synchronization logic.
- Ask before architectural changes.
- When in doubt about localStorage: there is no localStorage, everything goes through API.
