import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../core/stores/customer-store';
import { Product } from '../../core/stores/product-store';
import { CustomItemFormComponent, CustomItemInput } from './custom-item-form.component';

@Component({
  standalone: true,
  selector: 'app-invoice-product-selector',
  imports: [CommonModule, FormsModule, CustomItemFormComponent],
  templateUrl: './invoice-product-selector.component.html',
  styleUrls: ['./invoice-product-selector.component.scss']
})
export class InvoiceProductSelectorComponent {
  @Input() customers!: any; // signal function returning Customer[]
  @Input() products!: any; // signal function returning Product[]
  @Input() selectedCustomerId: string | null = null;

  @Output() selectedCustomerIdChange = new EventEmitter<string | null>();
  @Output() addToInvoice = new EventEmitter<{ product: Product; qty: number }>();
  @Output() addCustomItem = new EventEmitter<CustomItemInput>();

  public search: string = '';
  public showCustomItemForm: boolean = false;
  public recentlyAddedId: string | null = null;

  public get selectedCustomer(): Customer | undefined {
    return this.customers().find((c: Customer) => c.id === this.selectedCustomerId);
  }

  public getProductPrice(p: Product): number {
    const cust = this.selectedCustomer;
    if (cust && cust.groupId && p.prices && p.prices[cust.groupId] !== undefined) {
      return Number(p.prices[cust.groupId]);
    }
    // Fallback to first available price in prices record
    if (p.prices) {
      const vals = Object.values(p.prices);
      if (vals.length > 0) return Number(vals[0]);
    }
    return 0;
  }

  public filteredProducts(): Product[] {
    const q = (this.search || '').trim().toLowerCase();
    const list = this.products() || [];
    if (!q) return list;
    return list.filter((p: Product) => {
      const name = (p.name || '').toLowerCase();
      const hsn = (p.hsn || '').toLowerCase();
      return name.includes(q) || hsn.includes(q);
    });
  }

  public clearSearch() {
    this.search = '';
  }

  public onProductClick(p: Product) {
    this.recentlyAddedId = p.id;
    this.addToInvoice.emit({ product: p, qty: 1 });
    setTimeout(() => {
      if (this.recentlyAddedId === p.id) {
        this.recentlyAddedId = null;
      }
    }, 400);
  }

  public toggleCustomItemForm() {
    this.showCustomItemForm = !this.showCustomItemForm;
  }

  public onCustomItemCreated(item: CustomItemInput) {
    this.addCustomItem.emit(item);
    this.showCustomItemForm = false;
  }

  public onCustomItemCancelled() {
    this.showCustomItemForm = false;
  }
}
