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

  ngOnInit() {
    // Load customers from backend (with fallback to local storage)
    this.apiService.list().subscribe({
      next: (customers) => {
        console.log('Customers loaded:', customers);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        // API service already handles fallback to local storage
      },
    });
  }

  public add() {
    if (!this.form.name) return alert('Name required');
    if (this.editingId) {
      this.apiService.update(this.editingId, { name: this.form.name! }).subscribe({
        next: () => {
          console.log('Customer updated');
          this.editingId = undefined;
          this.form = { name: '' };
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          alert('Failed to update customer (using local storage)');
          this.editingId = undefined;
          this.form = { name: '' };
        },
      });
    } else {
      this.apiService.create({ name: this.form.name! }).subscribe({
        next: () => {
          console.log('Customer created');
          this.form = { name: '' };
        },
        error: (err) => {
          console.error('Error creating customer:', err);
          alert('Failed to create customer (using local storage)');
          this.form = { name: '' };
        },
      });
    }
  }

  public remove(id: string) {
    if (!confirm('Delete customer?')) return;
    this.apiService.delete(id).subscribe({
      next: () => {
        console.log('Customer deleted');
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer (using local storage)');
      },
    });
  }

  public edit(c: Customer) {
    this.editingId = c.id;
    this.form = { name: c.name };
  }

  public cancelEdit() {
    this.editingId = undefined;
    this.form = { name: '' };
  }
}
