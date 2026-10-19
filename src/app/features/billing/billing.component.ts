import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore, Customer } from '../../core/stores/customer-store';
import { customerGroupStore } from '../../core/stores/customer-group';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { productStore, Product } from '../../core/stores/product-store';
import { invoiceStore, Invoice, InvoiceItem } from '../../core/stores/invoice-store';
import { InvoiceApiService } from '../../core/services/invoice-api.service';
import { ProductApiService } from '../../core/services/product-api.service';
import {MatButtonModule} from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoiceProductSelectorComponent } from './invoice-product-selector.component';
import { InvoiceCartComponent } from './invoice-cart.component';
import { CustomItemInput } from './custom-item-form.component';
import { buildPrintable, exportInvoicePdf } from '../../core/utils/invoice-print';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule,MatTooltipModule, InvoiceProductSelectorComponent, InvoiceCartComponent],
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  
})
export class BillingComponent {
  private invoiceApi = inject(InvoiceApiService);
  private productApi = inject(ProductApiService);
  private customerApi = inject(CustomerApiService);

  public customers = customerStore.customers;
  public products = productStore.products;
  public customerGroups = customerGroupStore.groups;
  public selectedCustomerId: string | null = null;

  // Temporary / walk-in customer state
  public isTemporaryCustomer = false;
  public temporaryCustomerName = '';
  public temporaryCustomerPhone = '';
  public temporaryCustomerAddress = '';
  public temporaryCustomerGroupId = '';
  public saveTemporaryCustomerToDirectory = false;

  public search: string = '';
  public now: Date = new Date();
  public nowTs: number = Date.now();
  public invoiceItems: InvoiceItem[] = [];
  public showPicker = false;
  public showSaveCustomItemsDialog: boolean = false;
  public customItemsToSave: InvoiceItem[] = [];
  public customItemSaveSelection: Record<string, boolean> = {};

  @HostListener('window:keydown', ['$event'])
  public handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      if (this.invoiceItems.length > 0) {
        this.printBill();
      }
    } else if (event.key === 'F4') {
      event.preventDefault();
      this.newBill();
    }
  }

  public get selectedCustomer(): Customer | undefined {
    return this.customers().find(c => c.id === this.selectedCustomerId);
  }

  public get customerDisplayName(): string {
    if (this.isTemporaryCustomer) {
      const name = this.temporaryCustomerName.trim();
      return name ? `${name} (Walk-in)` : 'Walk-in Customer';
    }
    return this.selectedCustomer?.name || 'Walk-in Retail';
  }

  public get customerAddressDisplay(): string {
    return this.isTemporaryCustomer
      ? this.temporaryCustomerAddress.trim()
      : (this.selectedCustomer?.address || '');
  }

  public get effectiveCustomerGroupId(): string | undefined {
    return this.isTemporaryCustomer
      ? (this.temporaryCustomerGroupId || undefined)
      : this.selectedCustomer?.groupId;
  }

  public ngOnInit() {
    const defaultCust = this.customers()[0];
    if (defaultCust) { 
      this.selectedCustomerId = defaultCust.id;
    }
    this.now = new Date();
    this.nowTs = Date.now();
  }

  // --- forwarded handlers for child components
  public onSelectedCustomerChange(id: string | null) {
    this.selectedCustomerId = id;
  }

  public onIsTemporaryCustomerChange(val: boolean) {
    this.isTemporaryCustomer = val;
  }

  public onTemporaryCustomerNameChange(val: string) {
    this.temporaryCustomerName = val;
  }

  public onTemporaryCustomerPhoneChange(val: string) {
    this.temporaryCustomerPhone = val;
  }

  public onTemporaryCustomerAddressChange(val: string) {
    this.temporaryCustomerAddress = val;
  }

  public onTemporaryCustomerGroupIdChange(val: string) {
    this.temporaryCustomerGroupId = val;
  }

  public onSaveTemporaryCustomerToDirectoryChange(val: boolean) {
    this.saveTemporaryCustomerToDirectory = val;
  }

  public onAddToInvoice(payload: { product: Product; qty: number }) {
    this.addToInvoice(payload.product, payload.qty);
  }

  public onAddCustomItem(customItem: CustomItemInput) {
    this.addCustomItem(customItem);
  }

  public onUpdateQty(payload: { item: InvoiceItem; qty: number }) {
    this.updateQty(payload.item, payload.qty);
  }

  public onRemoveItem(id: string) {
    this.removeItem(id);
  }

  public onPrintBill() {
    this.printBill();
  }

  public onNewBill() {
    this.newBill();
  }

  public async onDownloadPdf() {
    if (!this.invoiceItems.length) return alert('No items to download');

    const custName = this.isTemporaryCustomer
      ? (this.temporaryCustomerName.trim() || 'Walk-in Customer')
      : (this.selectedCustomer?.name || 'Walk-in Customer');
    const custAddress = this.isTemporaryCustomer
      ? (this.temporaryCustomerAddress.trim() || undefined)
      : (this.selectedCustomer?.address || undefined);
    const custId = this.isTemporaryCustomer ? undefined : this.selectedCustomer?.id;

    const invoice: Invoice = {
      id: Date.now().toString(36),
      invoiceNo: '', // Will be auto-generated by backend
      date: new Date().toISOString(),
      customerId: custId,
      customerName: custName,
      customerAddress: custAddress,
      items: this.invoiceItems,
      subtotal: this.taxableTotal,
      totalGst: this.totalGst,
      total: this.total
    };
    
    // If shopkeeper opted to also save to permanent directory
    if (this.isTemporaryCustomer && this.saveTemporaryCustomerToDirectory && this.temporaryCustomerName.trim()) {
      this.customerApi.create({
        name: this.temporaryCustomerName.trim(),
        contact: this.temporaryCustomerPhone.trim() || undefined,
        address: this.temporaryCustomerAddress.trim() || undefined,
        groupId: this.temporaryCustomerGroupId || undefined,
      }).subscribe({
        next: (savedCust) => console.log('Temporary customer saved to directory:', savedCust),
        error: (err) => console.error('Failed to save customer to directory:', err)
      });
    }

    // Save to database
    this.invoiceApi.create(invoice).subscribe({
      next: (savedInvoice) => {
        console.log('Invoice saved to database:', savedInvoice);
        try {
          exportInvoicePdf(savedInvoice, `${savedInvoice.invoiceNo}.pdf`);
        } catch (e) {
          alert('Error generating PDF: ' + (e as any)?.message || e);
        }
        // Show save custom items dialog if there are custom items
        this.openSaveCustomItemsDialog(savedInvoice.items);
      },
      error: (err) => {
        alert('Error saving invoice: ' + (err?.message || 'Unknown error'));
      }
    });
  }

  public filteredProducts() {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter(p => {
      const name = (p.name || '').toLowerCase();
      const hsn = (p.hsn || '').toLowerCase();
      return name.includes(q) || hsn.includes(q);
    });
  }

  public addToInvoice(p: Product, qty = 1) {
    // Look up price using effective group (saved customer's group or temporary walk-in selected tier)
    const groupId = this.effectiveCustomerGroupId;
    let rate = 0;
    if (groupId && p.prices && p.prices[groupId] !== undefined) {
      rate = p.prices[groupId];
    } else if (p.prices) {
      const vals = Object.values(p.prices);
      if (vals.length > 0) rate = Number(vals[0]);
    }
    const gstFromHsn = this.getGstRateFromHsn(p.hsn);
    const item: InvoiceItem = {
      id: Date.now().toString(36),
      productId: p.id,
      name: p.name,
      hsn: p.hsn,
      qty,
      rate,
      gstRate: typeof gstFromHsn === 'number' ? gstFromHsn : (p.gstRate ?? 18),
      amount: qty * rate
    };
    const existing = this.invoiceItems.find(x => x.productId === p.id && x.rate === rate);
    if (existing) {
      existing.qty += qty;
      existing.amount = existing.qty * existing.rate;
    } else {
      this.invoiceItems = [...this.invoiceItems, item];
    }
  }

  public addCustomItem(customItem: CustomItemInput) {
    const item: InvoiceItem = {
      id: Date.now().toString(36),
      productId: `custom_${Date.now()}`, // Unique custom item ID
      name: customItem.name,
      hsn: customItem.hsn,
      qty: 1,
      rate: customItem.price,
      gstRate: customItem.gstRate,
      amount: customItem.price,
      isCustom: true // Mark as custom item
    };
    this.invoiceItems = [...this.invoiceItems, item];
  }

  // map known HSN codes to GST percentages; returns undefined if no mapping
  private getGstRateFromHsn(hsn?: string): number | undefined {
    if (!hsn) return undefined;
    const code = hsn.trim();
    // exact matches and special cases
    const mapping: Record<string | number, number | null> = {
      '4820': 12,
      '9608': 18,
      '4016': 18,
      '8214': 12,
      '8305': 18,
      '4817': 18,
      '4901': 0,
    };
    // some HSNs may be provided as longer strings; check startsWith for keys
    for (const k of Object.keys(mapping)) {
      if (code === k || code.startsWith(k)) {
        const val = mapping[k as any];
        if (val === null) return undefined;
        return val as number;
      }
    }
    // exempt list
    const exempt = ['9609', '9610'];
    for (const e of exempt) if (code === e || code.startsWith(e)) return 0;
    return undefined;
  }

  public updateQty(item: InvoiceItem, qty: number) {
    if (qty <= 0) return this.removeItem(item.id);
    item.qty = qty;
    item.amount = item.qty * item.rate;
    this.invoiceItems = [...this.invoiceItems];
  }

  public removeItem(id: string) {
    if (!confirm('Delete this item?')) return;
    this.invoiceItems = this.invoiceItems.filter(x => x.id !== id);
  }

  public get subtotal() {
    return this.invoiceItems.reduce((s, i) => s + i.amount, 0);
  }

  // Taxable amount assuming `rate` is tax-inclusive. Compute taxable per item.
  public taxableForItem(i: InvoiceItem) {
    const perUnitTaxable = i.rate / (1 + (i.gstRate / 100));
    return perUnitTaxable * i.qty;
  }

  public get taxableTotal() {
    return this.invoiceItems.reduce((s, i) => s + this.taxableForItem(i), 0);
  }

  public get totalGst() {
    return this.invoiceItems.reduce((s, i) => s + (i.amount - this.taxableForItem(i)), 0);
  }

  public get gstBreakdown() {
    const breakdown: Record<string, { taxable: number; cgst: number; sgst: number; totalGst: number }> = {};
    for (const item of this.invoiceItems) {
      const rate = item.gstRate;
      if (!breakdown[rate]) {
        breakdown[rate] = { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 };
      }
      const taxable = this.taxableForItem(item);
      const totalGst = item.amount - taxable;
      breakdown[rate].taxable += taxable;
      breakdown[rate].totalGst += totalGst;
      breakdown[rate].cgst += totalGst / 2;
      breakdown[rate].sgst += totalGst / 2;
    }
    return Object.entries(breakdown).map(([rate, values]) => ({
      rate: +rate,
      ...values
    }));
  }

  // total invoice amount (amounts are inclusive of GST)
  public get total() {
    return this.subtotal;
  }

  public printBill() {
    if (!this.invoiceItems.length) return alert('No items to print');

    const custName = this.isTemporaryCustomer
      ? (this.temporaryCustomerName.trim() || 'Walk-in Customer')
      : (this.selectedCustomer?.name || 'Walk-in Customer');
    const custAddress = this.isTemporaryCustomer
      ? (this.temporaryCustomerAddress.trim() || undefined)
      : (this.selectedCustomer?.address || undefined);
    const custId = this.isTemporaryCustomer ? undefined : this.selectedCustomer?.id;

    const invoice: Invoice = {
      id: Date.now().toString(36),
      invoiceNo: '', // Will be auto-generated by backend
      date: new Date().toISOString(),
      customerId: custId,
      customerName: custName,
      customerAddress: custAddress,
      items: this.invoiceItems,
      subtotal: this.taxableTotal,
      totalGst: this.totalGst,
      total: this.total
    };
    
    // If shopkeeper opted to also save to permanent directory
    if (this.isTemporaryCustomer && this.saveTemporaryCustomerToDirectory && this.temporaryCustomerName.trim()) {
      this.customerApi.create({
        name: this.temporaryCustomerName.trim(),
        contact: this.temporaryCustomerPhone.trim() || undefined,
        address: this.temporaryCustomerAddress.trim() || undefined,
        groupId: this.temporaryCustomerGroupId || undefined,
      }).subscribe({
        next: (savedCust) => console.log('Temporary customer saved to directory:', savedCust),
        error: (err) => console.error('Failed to save customer to directory:', err)
      });
    }

    // Save to database
    this.invoiceApi.create(invoice).subscribe({
      next: (savedInvoice) => {
        console.log('Invoice saved to database:', savedInvoice);
        const win = window.open('', '_blank');
        if (!win) return alert('Unable to open print window');
        const html = buildPrintable(savedInvoice);
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 300);
        // Show save custom items dialog if there are custom items
        this.openSaveCustomItemsDialog(savedInvoice.items);
      },
      error: (err) => {
        alert('Error saving invoice: ' + (err?.message || 'Unknown error'));
      }
    });
  }

  public newBill() {
    if (!confirm('Start a new bill?')) return;
    this.resetBillState();
  }

  private resetBillState() {
    this.invoiceItems = [];
    this.isTemporaryCustomer = false;
    this.temporaryCustomerName = '';
    this.temporaryCustomerPhone = '';
    this.temporaryCustomerAddress = '';
    this.temporaryCustomerGroupId = '';
    this.saveTemporaryCustomerToDirectory = false;
  }

  private openSaveCustomItemsDialog(invoiceItems: InvoiceItem[]) {
    // Filter only custom items and those without HSN
    const customItems = invoiceItems.filter(item => item.isCustom);
    
    if (!customItems.length) {
      this.resetBillState();
      return;
    }

    // Initialize selection and items to save
    this.customItemsToSave = customItems;
    this.customItemSaveSelection = {};
    customItems.forEach(item => {
      this.customItemSaveSelection[item.id] = false; // Default: unchecked
    });

    // Show dialog
    this.showSaveCustomItemsDialog = true;
  }

  public toggleCustomItemSelection(itemId: string) {
    this.customItemSaveSelection[itemId] = !this.customItemSaveSelection[itemId];
  }

  public cancelSaveCustomItems() {
    this.showSaveCustomItemsDialog = false;
    this.customItemsToSave = [];
    this.customItemSaveSelection = {};
    this.resetBillState();
  }

  public saveSelectedCustomItems() {
    const selectedItems = this.customItemsToSave.filter(
      item => this.customItemSaveSelection[item.id]
    );

    if (!selectedItems.length) {
      alert('No items selected to save');
      return;
    }

    // Save each selected item to products
    const groupId = this.effectiveCustomerGroupId;

    selectedItems.forEach(item => {
      // Create product from custom item
      const prices: Record<string, number> = {};
      
      // Assign price to customer's group
      if (groupId) {
        prices[groupId] = item.rate;
      }

      this.productApi.create({
        name: item.name,
        hsn: item.hsn || '',
        gstRate: item.gstRate,
        prices
      }).subscribe({
        next: () => console.log(`Custom item ${item.name} saved to product database`),
        error: (err) => console.error(`Failed to save custom item ${item.name}:`, err)
      });
    });

    alert(`Successfully saved ${selectedItems.length} item(s) to product list!`);
    
    // Close dialog and clear invoice
    this.showSaveCustomItemsDialog = false;
    this.customItemsToSave = [];
    this.customItemSaveSelection = {};
    this.resetBillState();
  }
}
