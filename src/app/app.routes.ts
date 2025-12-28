import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent:async () => {
      const m = await import('./features/billing/billing.component');
      console.log('Loaded BillingComponent');
      console.log(m);
      console.log(m.BillingComponent);
      return m.BillingComponent;
    },

  },
  {
    path: 'config',

    loadComponent: () =>
      import('./features/configuration/configuration.component').then(
        (m) => m.ConfigurationComponent
      ),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/customers.component').then((m) => m.CustomersComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./features/invoices/invoices.component').then((m) => m.InvoicesComponent),
  },
  { path: '**', redirectTo: '' },
];
