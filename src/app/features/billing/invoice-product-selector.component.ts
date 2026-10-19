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
  @Input() customerGroups: any; // signal function returning CustomerGroup[]
  @Input() selectedCustomerId: string | null = null;
  @Input() isTemporaryCustomer: boolean = false;
  @Input() temporaryCustomerName: string = '';
  @Input() temporaryCustomerPhone: string = '';
  @Input() temporaryCustomerAddress: string = '';
  @Input() temporaryCustomerGroupId: string = '';
  @Input() saveTemporaryCustomerToDirectory: boolean = false;

  @Output() selectedCustomerIdChange = new EventEmitter<string | null>();
  @Output() isTemporaryCustomerChange = new EventEmitter<boolean>();
  @Output() temporaryCustomerNameChange = new EventEmitter<string>();
  @Output() temporaryCustomerPhoneChange = new EventEmitter<string>();
  @Output() temporaryCustomerAddressChange = new EventEmitter<string>();
  @Output() temporaryCustomerGroupIdChange = new EventEmitter<string>();
  @Output() saveTemporaryCustomerToDirectoryChange = new EventEmitter<boolean>();
  @Output() addToInvoice = new EventEmitter<{ product: Product; qty: number }>();
  @Output() addCustomItem = new EventEmitter<CustomItemInput>();

  public search: string = '';
  public showCustomItemForm: boolean = false;
  public recentlyAddedId: string | null = null;

  public get selectedCustomer(): Customer | undefined {
    return this.customers().find((c: Customer) => c.id === this.selectedCustomerId);
  }

  public getGroupName(groupId?: string): string {
    if (!groupId || !this.customerGroups) return '';
    const groups = typeof this.customerGroups === 'function' ? this.customerGroups() : this.customerGroups;
    const g = (groups || []).find((x: any) => x.id === groupId);
    return g ? g.name : '';
  }

  public setCustomerMode(isTemp: boolean) {
    this.isTemporaryCustomer = isTemp;
    this.isTemporaryCustomerChange.emit(isTemp);
  }

  public onSelectedCustomerChange(val: string | null) {
    this.selectedCustomerId = val;
    this.selectedCustomerIdChange.emit(val);
  }

  public onTemporaryNameChange(val: string) {
    this.temporaryCustomerName = val;
    this.temporaryCustomerNameChange.emit(val);
  }

  public onTemporaryPhoneChange(val: string) {
    this.temporaryCustomerPhone = val;
    this.temporaryCustomerPhoneChange.emit(val);
  }

  public onTemporaryAddressChange(val: string) {
    this.temporaryCustomerAddress = val;
    this.temporaryCustomerAddressChange.emit(val);
  }

  public onTemporaryGroupChange(val: string) {
    this.temporaryCustomerGroupId = val;
    this.temporaryCustomerGroupIdChange.emit(val);
  }

  public onSaveToDirectoryChange(val: boolean) {
    this.saveTemporaryCustomerToDirectory = val;
    this.saveTemporaryCustomerToDirectoryChange.emit(val);
  }

  public getProductPrice(p: Product): number {
    const groupId = this.isTemporaryCustomer
      ? this.temporaryCustomerGroupId
      : this.selectedCustomer?.groupId;

    if (groupId && p.prices && p.prices[groupId] !== undefined) {
      return Number(p.prices[groupId]);
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
