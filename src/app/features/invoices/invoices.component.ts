import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { invoiceStore } from '../../core/stores/invoice-store';

const store = invoiceStore;

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent {
  public invoices = store.invoices;

  public delete(id: string) {
    if (!confirm('Delete invoice?')) return;
    const list = store.list().filter(i => i.id !== id);
    localStorage.setItem('ssc_invoices_v1', JSON.stringify(list));
    // refresh signal by reloading
    location.reload();
  }
}
