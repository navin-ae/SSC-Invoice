import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore, Customer } from '../../core/stores/customer-store';
import { productStore, Product } from '../../core/stores/product-store';
import { invoiceStore, Invoice, InvoiceItem } from '../../core/stores/invoice-store';
import {MatButtonModule} from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvoiceProductSelectorComponent } from './invoice-product-selector.component';
import { InvoiceCartComponent } from './invoice-cart.component';
import { buildPrintable, exportInvoicePdf } from '../../core/utils/invoice-print';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule,MatTooltipModule, InvoiceProductSelectorComponent, InvoiceCartComponent],
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  
})
export class BillingComponent {
  public customers = customerStore.customers;
  public products = productStore.products;
  public selectedCustomerId: string | null = null;
  public search: string = '';
  public now: Date = new Date();
  public nowTs: number = Date.now();
  public invoiceItems: InvoiceItem[] = [];
  public showPicker = false;

  public get selectedCustomer(): Customer | undefined {
    return this.customers().find(c => c.id === this.selectedCustomerId);
  }

  public addSampleData() {
    if (!this.customers().length) {
      customerStore.add({ name: 'Retail', address: '106, Main Road, Annur - 641653' });

    }
    if (!this.products().length) {
      // build prices keyed by customer id
      const custs = this.customers();
      const prices1: Record<string, number> = {};
      const prices2: Record<string, number> = {};
      custs.forEach((c, idx) => {
        prices1[c.id] = idx % 2 === 0 ? 45 : 40;
        prices2[c.id] = idx % 2 === 0 ? 12 : 10;
      });
      productStore.add({ name: 'Unruled Note', prices: prices1, hsn: '490199' });
      productStore.add({ name: 'Blue Pen', prices: prices2 });
    }
  }

  public ngOnInit() {
    this.addSampleData();
    const defaultCust = this.customers()[0];
    if (defaultCust){ 
      this.selectedCustomerId = defaultCust.id
    };
    this.now = new Date();
    this.nowTs = Date.now();
  }

  // --- forwarded handlers for child components
  public onSelectedCustomerChange(id: string | null) {
    this.selectedCustomerId = id;
  }

  public onAddToInvoice(payload: { product: Product; qty: number }) {
    this.addToInvoice(payload.product, payload.qty);
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
    const invoice: Invoice = {
      id: Date.now().toString(36),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerId: this.selectedCustomer?.id,
      customerName: this.selectedCustomer?.name,
      customerAddress: this.selectedCustomer?.address,
      items: this.invoiceItems,
      subtotal: this.taxableTotal,
      totalGst: this.totalGst,
      total: this.total
    };
    invoiceStore.save(invoice);
    try {
      await exportInvoicePdf(invoice, `${invoice.invoiceNo}.pdf`);
    } catch (e) {
      alert('Error generating PDF: ' + (e as any)?.message || e);
    }
    // clear invoice
    this.invoiceItems = [];
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
    const rate = p.prices[this.selectedCustomerId ?? ''] ?? 0;
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
    const invoice: Invoice = {
      id: Date.now().toString(36),
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerId: this.selectedCustomer?.id,
      customerName: this.selectedCustomer?.name,
      customerAddress: this.selectedCustomer?.address,
      items: this.invoiceItems,
      subtotal: this.taxableTotal,
      totalGst: this.totalGst,
      total: this.total
    };
    invoiceStore.save(invoice);
    const win = window.open('', '_blank');
    if (!win) return alert('Unable to open print window');
    const html = buildPrintable(invoice);
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
    this.invoiceItems = [];
  }





  public newBill() {
    if (!confirm('Start a new bill?')) return;
    this.invoiceItems = [];
  }
}
