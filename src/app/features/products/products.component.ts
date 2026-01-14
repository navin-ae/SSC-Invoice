import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, productStore } from '../../core/stores/product-store';
import { customerStore } from '../../core/stores/customer-store';

const store = productStore;

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  public products = store.products;
  public customers = customerStore.customers;

  public form: Partial<Product> = { name: '', hsn: '', gstRate: 12, prices: {} };
  public editingId?: string;
  public query = '';
  public page = 1;
  public pageSize = 20;
  // track which customer prices were manually edited (should not be overwritten by retail default)
  public overrides = new Set<string>();

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
      store.update(this.editingId, {
        name: this.form.name!,
        hsn: this.form.hsn,
        gstRate: this.form.gstRate,
        prices
      });
      this.editingId = undefined;
    } else {
      store.add({
        name: this.form.name!,
        hsn: this.form.hsn,
        gstRate: this.form.gstRate,
        prices
      });
    }

    this.form = { name: '', hsn: '', gstRate: 12, prices: {} };
    this.overrides = new Set();
    // reset pagination to show new item on first page
    this.page = 1;
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
    store.remove(id);
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
