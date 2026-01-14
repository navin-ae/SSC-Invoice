import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceItem } from '../../core/stores/invoice-store';

@Component({
  standalone: true,
  selector: 'app-invoice-cart',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './invoice-cart.component.html',
  styleUrls: ['./invoice-cart.component.scss']
})
export class InvoiceCartComponent {
  @Input() invoiceItems: InvoiceItem[] = [];
  @Input() taxableTotal: number = 0;
  @Input() totalGst: number = 0;
  @Input() total: number = 0;
  @Input() now!: Date;
  @Input() nowTs!: number;
  @Input() selectedCustomer: any;
  @Input() gstBreakdown: { rate: number; taxable: number; cgst: number; sgst: number; totalGst: number }[] = [];

  @Output() updateQty = new EventEmitter<{ item: InvoiceItem; qty: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() printBill = new EventEmitter<void>();
  @Output() downloadPdf = new EventEmitter<void>();
  @Output() newBill = new EventEmitter<void>();

  onQtyChange(item: InvoiceItem, event: Event) {
    const target = event.target as HTMLInputElement;
    const qty = target?.valueAsNumber ?? item.qty;
    this.updateQty.emit({ item, qty });
  }
}
