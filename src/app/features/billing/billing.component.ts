import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore, Customer } from '../../core/stores/customer-store';
import { productStore, Product } from '../../core/stores/product-store';
import { invoiceStore, Invoice, InvoiceItem } from '../../core/stores/invoice-store';
import {MatButtonModule} from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule,MatTooltipModule],
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
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
      customerStore.add({ name: 'Retail'});

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
    if (defaultCust) this.selectedCustomerId = defaultCust.id;
    this.now = new Date();
    this.nowTs = Date.now();
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
      items: this.invoiceItems,
      subtotal: this.taxableTotal,
      totalGst: this.totalGst,
      total: this.total
    };
    invoiceStore.save(invoice);
    const win = window.open('', '_blank');
    if (!win) return alert('Unable to open print window');
    const html = this.buildPrintable(invoice);
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
    this.invoiceItems = [];
  }


  public buildPrintable(inv: Invoice) {
    // Shop header data (customise as needed)
    const shop = {
      name: 'Surya Shopping Centre',
      addr1: '106, Main Road',
      addr2: 'Annur - PIN-641653',
      gstin: 'GSTIN: 33AA45WER35SVX',
      phone: 'Phone: 9994813066'
    };

    const rows = inv.items.map((i, idx) => {
      const taxable = (i.rate / (1 + (i.gstRate / 100))) * i.qty;
      const gst = i.amount - taxable;
      return `<tr>
        <td style="text-align:center">${idx + 1}</td>
        <td>${i.name}</td>
        <td style="text-align:center">${i.hsn ?? ''}</td>
        <td style="text-align:center">${i.gstRate}%</td>
        <td style="text-align:center">${i.qty}</td>
        <td style="text-align:right">₹${i.rate.toFixed(2)}</td>
        <td style="text-align:right">₹${i.amount.toFixed(2)}</td>
      </tr>`;
    }).join('');

    const cgst = inv.totalGst / 2;
    const sgst = inv.totalGst / 2;

    const summaryHtml = `
      <tr><td>Taxable Value</td><td style="text-align:right">₹${inv.subtotal.toFixed(2)}</td></tr>
      <tr><td>CGST</td><td style="text-align:right">₹${cgst.toFixed(2)}</td></tr>
      <tr><td>SGST</td><td style="text-align:right">₹${sgst.toFixed(2)}</td></tr>
      <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>₹${inv.total.toFixed(2)}</strong></td></tr>
    `;

    return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>
      @page { size: A5 portrait; margin: 8mm; }
      body{font-family:Arial;padding:10px;color:#111;max-width:148mm;margin:0 auto}
      .header{display:flex;justify-content:space-between;margin-bottom:12px}
      .seller{font-weight:normal}
      .seller .name{font-weight:700}
      table{width:100%;border-collapse:separate;border-spacing:0}
      /* vertical-only column lines: left/right borders on cells, no horizontal separators between rows */
      th,td{padding:6px;font-size:13px;border-top:0;border-bottom:0;border-left:1px solid #ccc;border-right:1px solid #ccc}
      thead th{border-top:1px solid #ccc; border-bottom:1px solid #ccc}
      /* ensure outer table has left/right borders */
      tr th:first-child, tr td:first-child{border-left:1px solid #ccc}
      tr th:last-child, tr td:last-child{border-right:1px solid #ccc}
      /* add a bottom horizontal line under the final row to close the table */
      tbody tr:last-child td{border-bottom:1px solid #ccc}
      .right-table{width:300px;border:0;margin-left:auto;border-collapse:separate}
      .right-table td{border-left:1px solid #ddd;border-right:1px solid #ddd;border-top:0;border-bottom:0;padding:6px}
      .right-table tr:last-child td{border-bottom:1px solid #ddd}
      .no-border td{border:0;padding:2px}
    </style></head><body>
      <div class="header">
        <div class="seller">
          <div class="name" style="font-size:16px">${shop.name}</div>
          <div>${shop.addr1}</div>
          <div>${shop.addr2}</div>
          <div>${shop.gstin}</div>
          <div>${shop.phone}</div>
        </div>
        <div class="inv-meta" style="text-align:right">
          <div>Invoice No: <strong>${inv.invoiceNo}</strong></div>
          <div>Date: ${new Date(inv.date).toLocaleDateString()}</div>
          <div>Time: ${new Date(inv.date).toLocaleTimeString()}</div>
          <div>Bill To: ${inv.customerName ?? 'Walk-in'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width:40px">S.No</th>
            <th>Description</th>
            <th style="width:80px">HSN/SAC</th>
            <th style="width:60px">GST</th>
            <th style="width:60px">Qty</th>
            <th style="width:100px">Rate</th>
            <th style="width:120px">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="display:flex;margin-top:8px">
        <div style="flex:1"></div>
        <div style="width:320px">
          <table class="right-table">
            <tbody>
              ${summaryHtml}
            </tbody>
          </table>
        </div>
      </div>

      <div style="margin-top:12px;font-size:12px">Amount in words: INR ${this.amountInWords(inv.total)}</div>
    </body></html>`;
  }

  // helper to convert number to words (simple, limited)
  public amountInWords(n: number) {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function inWords(num: number) {
      if (num === 0) return 'Zero';
      if (num < 20) return a[num];
      if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
      if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + inWords(num % 100) : '');
      if (num < 100000) return inWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + inWords(num % 1000) : '');
      if (num < 10000000) return inWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + inWords(num % 100000) : '');
      return inWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + inWords(num % 10000000) : '');
    }
    const x = Math.round(n);
    return inWords(x) + ' Only';
  }


  public newBill() {
    if (!confirm('Start a new bill?')) return;
    this.invoiceItems = [];
  }
}
