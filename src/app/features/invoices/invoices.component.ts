import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoiceStore, Invoice } from '../../core/stores/invoice-store';
import { InvoiceApiService } from '../../core/services/invoice-api.service';
import { buildPrintable, exportInvoicePdf } from '../../core/utils/invoice-print';
import { exportInvoicesCsv } from '../../core/utils/invoice-export';
import { exportInvoicesXlsx, exportGstr1Xlsx, exportInvoicesZip } from '../../core/utils/invoice-export-advanced';

import { MatButtonModule } from '@angular/material/button';

const store = invoiceStore;

@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  private invoiceApi = inject(InvoiceApiService);
  public invoices = store.invoices;
  public selectedFilter = 'all';
  public rangeStart?: Date;
  public rangeEnd?: Date;
  public currentRange?: string;

  private FY_START_MONTH = 4; // April - financial year start month (1-12)

  constructor() {
    this.applyFilter();
  }

  public ngOnInit() {
    // Load invoices from backend on component init
    this.invoiceApi.list().subscribe({
      next: () => {
        console.log('Invoices loaded from backend');
      },
      error: (err) => {
        console.warn('Error loading invoices from backend:', err);
      }
    });
  }

  public onFilterChange(e: Event | string) {
    let f: string = typeof e === 'string' ? e : ((e.target as HTMLSelectElement)?.value ?? 'all');
    this.selectedFilter = f;
    // don't auto-apply for 'custom' (not implemented)
    if (f !== 'custom') this.applyFilter();
  }

  public applyFilter() {
    const r = this.computeRange(this.selectedFilter);
    if (r) {
      this.rangeStart = r.start;
      this.rangeEnd = r.end;
      this.currentRange = `${r.start.toLocaleDateString()} — ${r.end.toLocaleDateString()}`;
    } else {
      this.rangeStart = undefined;
      this.rangeEnd = undefined;
      this.currentRange = undefined;
    }
  }

  public get filteredInvoices(): Invoice[] {
    const list = store.list();
    if (!this.rangeStart || !this.rangeEnd) return list;
    const start = this.startOfDay(this.rangeStart).getTime();
    const end = this.endOfDay(this.rangeEnd).getTime();
    return list.filter(inv => {
      const t = new Date(inv.date).getTime();
      return t >= start && t <= end;
    });
  }

  public exportCsv() {
    const list = this.filteredInvoices;
    if (!list.length) return alert('No invoices to export');
    const filename = `invoices-${this.selectedFilter}-${new Date().toISOString()}.csv`;
    exportInvoicesCsv(list, filename);
  }

  public async exportXlsx() {
    const list = this.filteredInvoices;
    if (!list.length) return alert('No invoices to export');
    try {
      await exportInvoicesXlsx(list, `invoices-${this.selectedFilter}-${new Date().toISOString()}.xlsx`);
    } catch (e) {
      alert('XLSX export failed: ' + (e as any)?.message);
    }
  }

  public async exportGstr1() {
    const list = this.filteredInvoices;
    if (!list.length) return alert('No invoices to export');
    try {
      await exportGstr1Xlsx(list, `gstr1-${this.selectedFilter}-${new Date().toISOString()}.xlsx`);
    } catch (e) {
      alert('GSTR-1 export failed: ' + (e as any)?.message);
    }
  }

  public async exportPdfsZip() {
    const list = this.filteredInvoices;
    if (!list.length) return alert('No invoices to export');
    try {
      await exportInvoicesZip(list, `invoices-${this.selectedFilter}-${new Date().toISOString()}.zip`);
    } catch (e) {
      alert('PDF ZIP export failed: ' + (e as any)?.message);
    }
  }

  public viewFiltered() {
    const list = this.filteredInvoices;
    if (!list.length) return alert('No invoices to view');
    const win = window.open('', '_blank');
    if (!win) return alert('Unable to open window');
    const rows = list.map(inv => `<tr><td>${inv.invoiceNo}</td><td>${inv.customerName || 'Walk-in'}</td><td>${new Date(inv.date).toLocaleString()}</td><td>₹${inv.total.toFixed(2)}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoices</title></head><body><h1>Invoices</h1><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  public view(inv: Invoice) {
    const win = window.open('', '_blank');
    if (!win) {
      return alert('Unable to open window');
    }
    const html = buildPrintable(inv);
    win.document.write(html);
    win.document.close();
    win.focus();
  }

  public async print(inv: Invoice) {
    const win = window.open('', '_blank');
    if (!win) return alert('Unable to open print window');
    const html = buildPrintable(inv);
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  public async download(inv: Invoice) {
    try {
      await exportInvoicePdf(inv, `${inv.invoiceNo}.pdf`);
    } catch (e) {
      alert('Error generating PDF: ' + (e as any)?.message || e);
    }
  }

  public delete(id: string) {
    if (!confirm('Delete invoice?')) return;
    this.invoiceApi.delete(id).subscribe({
      next: () => {
        console.log('Invoice deleted from database');
      },
      error: (err) => {
        alert('Error deleting invoice: ' + (err?.message || 'Unknown error'));
      }
    });
  }

  // helpers
  private startOfDay(d: Date) { const t = new Date(d); t.setHours(0,0,0,0); return t; }
  private endOfDay(d: Date) { const t = new Date(d); t.setHours(23,59,59,999); return t; }
  private startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999); }
  private startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1); }
  private endOfYear(d: Date) { return new Date(d.getFullYear(), 11, 31, 23,59,59,999); }

  private computeRange(key: string): {start: Date; end: Date} | undefined {
    const now = new Date();
    switch (key) {
      case 'last7': {
        const end = new Date(now);
        const start = new Date(now); start.setDate(start.getDate() - 6);
        return {start: this.startOfDay(start), end: this.endOfDay(end)};
      }
      case 'thisMonth': {
        const start = this.startOfMonth(now);
        const end = this.endOfMonth(now);
        return {start, end};
      }
      case 'lastMonth': {
        const m = new Date(now.getFullYear(), now.getMonth()-1, 1);
        return {start: this.startOfMonth(m), end: this.endOfMonth(m)};
      }
      case 'thisYear': {
        return {start: this.startOfYear(now), end: this.endOfYear(now)};
      }
      case 'lastYear': {
        const y = new Date(now.getFullYear()-1, 0, 1);
        return {start: this.startOfYear(y), end: this.endOfYear(y)};
      }
      case 'finYear': {
        return this.financialYearRange(now);
      }
      case 'finQuarter': {
        return this.financialQuarterRange(now);
      }
      case 'all':
        return undefined;
      default:
        return undefined;
    }
  }

  private financialYearRange(d: Date) {
    const fyStartMonth = this.FY_START_MONTH; // 1-based month index
    const m = d.getMonth() + 1; // 1-based
    let startYear = d.getFullYear();
    if (m < fyStartMonth) startYear -= 1;
    const start = new Date(startYear, fyStartMonth - 1, 1);
    const end = new Date(startYear + 1, fyStartMonth - 1, 0, 23,59,59,999);
    return {start: this.startOfDay(start), end: this.endOfDay(end)};
  }

  private financialQuarterRange(d: Date) {
    const fyStartMonth = this.FY_START_MONTH; // 1-based
    // build months array starting from fyStartMonth
    const months = [];
    for (let i = 0; i < 12; i++) months.push(((fyStartMonth - 1 + i) % 12));
    // find which 3-month quarter current month index falls into
    const cur = d.getMonth(); // 0-based
    const idx = months.indexOf(cur);
    const quarterIndex = Math.floor(idx / 3);
    const qStartMonth = months[quarterIndex];
    const qStartYear = (qStartMonth <= d.getMonth()) ? d.getFullYear() : d.getFullYear() - 1;
    const start = new Date(qStartYear, qStartMonth, 1);
    const end = this.endOfMonth(new Date(qStartYear, qStartMonth + 2, 1));
    return {start: this.startOfDay(start), end: this.endOfDay(end)};
  }

}
