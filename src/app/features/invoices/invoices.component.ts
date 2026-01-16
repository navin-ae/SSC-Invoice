import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoiceStore, Invoice } from '../../core/stores/invoice-store';
import { buildPrintable, exportInvoicePdf } from '../../core/utils/invoice-print';

import { MatButtonModule } from '@angular/material/button';

const store = invoiceStore;

@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent {
  public invoices = store.invoices;

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
    const list = store.list().filter(i => i.id !== id);
    localStorage.setItem('ssc_invoices_v1', JSON.stringify(list));
    // refresh signal by reloading
    location.reload();
  }
}
