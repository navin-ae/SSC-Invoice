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

  public filteredProducts() {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter((p: Product) => {
      const name = (p.name || '').toLowerCase();
      const hsn = (p.hsn || '').toLowerCase();
      return name.includes(q) || hsn.includes(q);
    });
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
