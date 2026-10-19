import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, productStore } from '../../core/stores/product-store';
import { customerStore } from '../../core/stores/customer-store';
import { customerGroupStore } from '../../core/stores/customer-group';
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
  public groups = customerGroupStore.groups;
  public customers = customerStore.customers;

  public form: Partial<Product> = { name: '', hsn: '', gstRate: 12, prices: {} };
  public editingId?: string;
  public query = '';
  public page = 1;
  public pageSize = 20;
  // track which group prices were manually edited
  public overrides = new Set<string>();
  public gstPresets = [0, 5, 12, 18, 28];

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

  public setGstRate(rate: number) {
    this.form.gstRate = rate;
  }

  public clearSearch() {
    this.query = '';
    this.page = 1;
  }

  public getFirstPrice(p: Product): number {
    if (!p || !p.prices) return 0;
    const vals = Object.values(p.prices);
    return vals.length > 0 ? vals[0] : 0;
  }

  // determine the first group as template (prefer group named 'Retail')
  public get templateGroupId(): string | undefined {
    const list = this.groups() || [];
    const r = list.find(g => (g.name || '').toLowerCase() === 'retail');
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
    // build prices per group id
    const prices: Record<string, number> = {};
    const grps = this.groups();
    grps.forEach(g => { prices[g.id] = Number(this.form.prices?.[g.id] ?? 0); });

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
          alert('Failed to update product in database: ' + (err?.error?.detail || err?.message || 'Server error'));
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
          alert('Failed to create product in database: ' + (err?.error?.detail || err?.message || 'Server error'));
          this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
          this.overrides = new Set();
        },
      });
    }
  }

  public edit(p: Product) {
    this.editingId = p.id;
    this.form = { name: p.name, hsn: p.hsn, gstRate: p.gstRate, prices: { ...p.prices } };
    // compute overrides: if a group's price differs from template price, consider it overridden
    this.overrides = new Set();
    const tid = this.templateGroupId;
    if (tid) {
      const templatePrice = this.form.prices?.[tid];
      this.groups().forEach(g => {
        if (g.id === tid) return;
        const cur = this.form.prices?.[g.id];
        if (typeof templatePrice !== 'undefined' && cur !== templatePrice) this.overrides.add(g.id);
      });
    }
  }

  public cancelEdit() {
    this.editingId = undefined;
    this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
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
        alert('Failed to delete product from database: ' + (err?.error?.detail || err?.message || 'Server error'));
      },
    });
  }

  // called when a price input changes for a group
  public onPriceChange(groupId: string, value: any) {
    this.form.prices = this.form.prices || {};
    const num = Number(value || 0);
    this.form.prices[groupId] = num;
    // mark this group as manually edited
    this.overrides.add(groupId);

    // if template was edited, propagate to non-overridden groups
    if (groupId === this.templateGroupId) {
      this.groups().forEach(g => {
        if (g.id === groupId) return;
        if (!this.overrides.has(g.id)) this.form.prices![g.id] = num;
      });
    }
  }

  public getCustomerCountForGroup(groupId: string): number {
    return this.customers().filter(c => c.groupId === groupId).length;
  }
}
