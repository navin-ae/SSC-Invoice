import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, productStore } from '../../core/stores/product-store';
import { customerStore } from '../../core/stores/customer-store';
import { ProductApiService } from '../../core/services/product-api.service';

const store = productStore;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  public products = store.products;
  public customers = customerStore.customers;

  public form: Partial<Product> = { name: '', hsn: '', gstRate: 12, prices: {} };
  public editingId?: string;
  public query = '';
  public page = 1;
  public pageSize = 20;
  // track which customer prices were manually edited (should not be overwritten by retail default)
  public overrides = new Set<string>();

  private apiService = inject(ProductApiService);

  ngOnInit() {
    // Load products from backend (with fallback to local storage)
    this.apiService.list().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        // API service already handles fallback to local storage
      },
    });
  }

  // determine the retail customer id (prefer customer named 'Retail', fallback to first)
  public get retailId(): string | undefined {
    const list = this.customers() || [];
    const r = list.find(c => (c.name || '').toLowerCase() === 'retail');
    return r ? r.id : (list[0] && list[0].id);
  }

  public get filteredProducts() {
    const q = this.query?.trim().toLowerCase();
    const all = this.products() || [];
    if (!q) return all;
    return all.filter(p => {
      return (p.name || '').toLowerCase().includes(q) || (p.hsn || '').toLowerCase().includes(q);
    });
  }

  public get pageCount() {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  public get paginatedProducts() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  public add() {
    if (!this.form.name) return alert('Name required');
    // build prices per customer id
    const prices: Record<string, number> = {};
    const custs = this.customers();
    custs.forEach(c => { prices[c.id] = Number(this.form.prices?.[c.id] ?? 0); });

    if (this.editingId) {
      this.apiService.update(this.editingId, {
        name: this.form.name!,
        hsn: this.form.hsn,
        gstRate: this.form.gstRate,
        prices
      }).subscribe({
        next: () => {
          console.log('Product updated');
          this.editingId = undefined;
          this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
          this.overrides = new Set();
          this.page = 1;
        },
        error: (err) => {
          console.error('Error updating product:', err);
          alert('Failed to update product (using local storage)');
          this.editingId = undefined;
          this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
          this.overrides = new Set();
        },
      });
    } else {
      this.apiService.create({
        name: this.form.name!,
        hsn: this.form.hsn,
        gstRate: this.form.gstRate,
        prices
      }).subscribe({
        next: () => {
          console.log('Product created');
          this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
          this.overrides = new Set();
          this.page = 1;
        },
        error: (err) => {
          console.error('Error creating product:', err);
          alert('Failed to create product (using local storage)');
          this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
          this.overrides = new Set();
        },
      });
    }
  }

  public edit(p: Product) {
    this.editingId = p.id;
    this.form = { name: p.name, hsn: p.hsn, gstRate: p.gstRate, prices: { ...p.prices } };
    // compute overrides: if a customer's price differs from retail price, consider it overridden
    this.overrides = new Set();
    const rid = this.retailId;
    if (rid) {
      const retailPrice = this.form.prices?.[rid];
      this.customers().forEach(c => {
        if (c.id === rid) return;
        const cur = this.form.prices?.[c.id];
        if (typeof retailPrice !== 'undefined' && cur !== retailPrice) this.overrides.add(c.id);
      });
    }
  }

  public cancelEdit() {
    this.editingId = undefined;
    this.form = { name: '', hsn: '', gstRate: 0, prices: {} };
    this.overrides = new Set();
  }

  public remove(id: string) {
    if (!confirm('Delete product?')) return;
    this.apiService.delete(id).subscribe({
      next: () => {
        console.log('Product deleted');
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        alert('Failed to delete product (using local storage)');
      },
    });
  }

  // called when a price input changes for a customer
  public onPriceChange(customerId: string, value: any) {
    this.form.prices = this.form.prices || {};
    const num = Number(value || 0);
    this.form.prices[customerId] = num;
    // mark this customer as manually edited
    this.overrides.add(customerId);

    // if retail was edited, propagate to non-overridden customers
    if (customerId === this.retailId) {
      this.customers().forEach(c => {
        if (c.id === customerId) return;
        if (!this.overrides.has(c.id)) this.form.prices![c.id] = num;
      });
    }
  }
}
