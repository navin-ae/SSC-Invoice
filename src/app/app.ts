import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CustomerApiService } from './core/services/customer-api.service';
import { ProductApiService } from './core/services/product-api.service';
import { InvoiceApiService } from './core/services/invoice-api.service';
import { CustomerGroupApiService } from './core/services/customer-group-api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit {
  private customerGroupApi = inject(CustomerGroupApiService);
  private customerApi = inject(CustomerApiService);
  private productApi = inject(ProductApiService);
  private invoiceApi = inject(InvoiceApiService);

  ngOnInit() {
    this.customerGroupApi.list().subscribe({
      next: () => console.log('Customer groups loaded from API'),
      error: (err) => console.error('Failed to load customer groups at startup', err),
    });
    this.customerApi.list().subscribe({
      next: () => console.log('Customers loaded from API'),
      error: (err) => console.error('Failed to load customers at startup', err),
    });
    this.productApi.list().subscribe({
      next: () => console.log('Products loaded from API'),
      error: (err) => console.error('Failed to load products at startup', err),
    });
    this.invoiceApi.list().subscribe({
      next: () => console.log('Invoices loaded from API'),
      error: (err) => console.error('Failed to load invoices at startup', err),
    });
  }
}

