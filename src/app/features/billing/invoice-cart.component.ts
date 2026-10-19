import { Component, Output, EventEmitter, input } from '@angular/core';
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
  public invoiceItems = input<InvoiceItem[]>([]);
  public taxableTotal = input(0);
  public totalGst = input(0);
  public total = input(0);
  public now = input.required<Date>();
  public nowTs = input.required<number>();
  public selectedCustomer = input.required<any>();
  public gstBreakdown = input<{ rate: number; taxable: number; cgst: number; sgst: number; totalGst: number }[]>([]);

  @Output() public updateQty = new EventEmitter<{ item: InvoiceItem; qty: number }>();
  @Output() public removeItem = new EventEmitter<string>();
  @Output() public printBill = new EventEmitter<void>();
  @Output() public downloadPdf = new EventEmitter<void>();
  @Output() public newBill = new EventEmitter<void>();

  public onQtyChange(item: InvoiceItem, event: Event) {
    const target = event.target as HTMLInputElement;
    const qty = Math.max(1, target?.valueAsNumber || 1);
    this.updateQty.emit({ item, qty });
  }

  public stepQty(item: InvoiceItem, delta: number) {
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      this.removeItem.emit(item.id);
    } else {
      this.updateQty.emit({ item, qty: newQty });
    }
  }
}
