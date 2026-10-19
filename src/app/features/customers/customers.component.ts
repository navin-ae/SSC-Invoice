import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore as store, Customer } from '../../core/stores/customer-store';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  public customers = store.customers;

  public form: Partial<Customer> = { name: '' };
  public editingId?: string;
  private apiService = inject(CustomerApiService);

  public ngOnInit() {
    // Load customers from backend database
    this.apiService.list().subscribe({
      next: (customers) => {
        console.log('Customers loaded from database:', customers);
      },
      error: (err) => {
        console.error('Error loading customers from database:', err);
      },
    });
  }

  public add() {
    if (!this.form.name?.trim()) return alert('Name required');
    const customerData = {
      name: this.form.name.trim(),
      contact: this.form.contact,
      gst: this.form.gst,
      address: this.form.address,
      groupId: this.form.groupId,
    };

    if (this.editingId) {
      this.apiService.update(this.editingId, customerData).subscribe({
        next: () => {
          console.log('Customer updated in database');
          this.editingId = undefined;
          this.form = { name: '' };
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          alert('Failed to update customer in database: ' + (err?.error?.detail || err?.message || 'Server error'));
        },
      });
    } else {
      this.apiService.create(customerData).subscribe({
        next: () => {
          console.log('Customer created in database');
          this.form = { name: '' };
        },
        error: (err) => {
          console.error('Error creating customer:', err);
          alert('Failed to create customer in database: ' + (err?.error?.detail || err?.message || 'Server error'));
        },
      });
    }
  }

  public remove(id: string) {
    if (!confirm('Delete customer?')) return;
    this.apiService.delete(id).subscribe({
      next: () => {
        console.log('Customer deleted from database');
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer from database: ' + (err?.error?.detail || err?.message || 'Server error'));
      },
    });
  }

  public edit(c: Customer) {
    this.editingId = c.id;
    this.form = { ...c };
  }

  public cancelEdit() {
    this.editingId = undefined;
    this.form = { name: '' };
  }
}
