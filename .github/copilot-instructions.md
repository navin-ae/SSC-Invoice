## Copilot / AI Agent Instructions (concise)

Purpose: help AI agents produce scalable, testable Angular applications for this product-inventory & billing app.

- Quick commands
  - Dev: `npm start` (runs `ng serve`)
  - Build: `npm run build` (`ng build`)
  - Watch: `npm run watch`
  - Tests: `npm test` (`ng test` — Vitest + jsdom)

- Architecture & conventions (must follow)
  - Style: feature-first layout. Place feature code under `src/app/features/<feature>`; shared/core under `src/app/core` and types under `src/app/types`.
  - Components: standalone components + `bootstrapApplication` (see [src/main.ts](src/main.ts)).
  - State: use Angular Signals for local and shared state. Prefer composable signal-based stores in `core` (e.g., `createProductStore()` returning signals and actions).
  - Templates: prefer the reactive control-flow syntax (`@if`, `@for`) for clarity and predictable change detection.
  - Routing: lazy-load feature components with `loadComponent` in [src/app/app.routes.ts](src/app/app.routes.ts).
  - Styles: SCSS; keep component-level styles with the component file.
  - TypeScript: strict mode enabled — keep types explicit and small DTOs under `src/app/types`.
  - Formatting: use Prettier configuration from `package.json` (respect the `*.html` Angular parser).

- Testing & CI
  - Unit tests: use `ng test` (Vitest). Write isolated tests for stores and standalone components using `render()` helpers and `jsdom`.
  - E2E: not configured here; do not add assumptions about existing e2e setup.

- Small examples (follow these patterns)
  - Feature route (lazy-load):

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'products', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) }
];
```

  - Standalone component + signals (skeleton):

```ts
import { Component, signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent {
  products = signal<Product[]>([]);
  loading = signal(false);
}
```

- Docs & references (official)
  - Angular: https://angular.io
  - Signals guide: https://angular.io/guide/signals
  - Standalone components: https://angular.io/guide/standalone-components
  - Router lazy loading: https://angular.io/guide/router
  - Template reactive control flow: https://angular.io/guide/control-flow (use `@if`/`@for` patterns)
  - CLI & build: https://angular.io/cli
  - Testing: https://angular.io/guide/testing

Follow these rules when making changes; ask for clarification before introducing global architectural changes.
