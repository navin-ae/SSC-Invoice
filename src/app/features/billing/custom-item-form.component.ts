import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

export interface CustomItemInput {
  name: string;
  price: number;
  hsn?: string;
  gstRate: number;
}

@Component({
  standalone: true,
  selector: 'app-custom-item-form',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './custom-item-form.component.html',
  styleUrls: ['./custom-item-form.component.scss']
})
export class CustomItemFormComponent {
  @Output() itemCreated = new EventEmitter<CustomItemInput>();
  @Output() cancelled = new EventEmitter<void>();

  public name: string = '';
  public price: number | null = null;
  public hsn: string = '';
  public gstRate: number = 18;
  public useCustomGst: boolean = false;

  public standardGstRates = [5, 12, 18, 28];
  public errorMessage: string = '';

  public onAddItem() {
    this.errorMessage = '';

    // Validation
    if (!this.name.trim()) {
      this.errorMessage = 'Item name is required';
      return;
    }

    if (this.price === null || this.price <= 0) {
      this.errorMessage = 'Price must be greater than 0';
      return;
    }

    const item: CustomItemInput = {
      name: this.name.trim(),
      price: this.price,
      hsn: this.hsn.trim() || undefined,
      gstRate: this.gstRate
    };

    this.itemCreated.emit(item);

    // Reset form
    this.name = '';
    this.price = null;
    this.hsn = '';
    this.gstRate = 18;
    this.useCustomGst = false;
  }

  public onCancel() {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm() {
    this.name = '';
    this.price = null;
    this.hsn = '';
    this.gstRate = 18;
    this.useCustomGst = false;
    this.errorMessage = '';
  }

  public onGstTypeChange() {
    if (!this.useCustomGst && this.standardGstRates.includes(this.gstRate)) {
      // Already has a valid standard rate
    } else if (!this.useCustomGst) {
      this.gstRate = 18; // Reset to default if switching from custom
    }
  }
}
