import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore as store, Customer } from '../../core/stores/customer-store';
import { customerGroupStore } from '../../core/stores/customer-group';
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
  public groups = customerGroupStore.groups;
  public search = '';

  public form: Partial<Customer> = { name: '', contact: '', gst: '', address: '', groupId: '' };
  public editingId?: string;
  private apiService = inject(CustomerApiService);

  public ngOnInit() {
    this.apiService.list().subscribe({
      next: (customers) => {
        console.log('Customers loaded from database:', customers);
      },
      error: (err) => {
        console.error('Error loading customers from database:', err);
      },
    });
  }

  public get filteredCustomers(): Customer[] {
    const q = (this.search || '').trim().toLowerCase();
    const list = this.customers() || [];
    if (!q) return list;
    return list.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.contact || '').toLowerCase().includes(q) ||
      (c.gst || '').toLowerCase().includes(q)
    );
  }

  public getGroupName(groupId?: string): string {
    if (!groupId) return 'Standard (Retail)';
    const g = this.groups().find(x => x.id === groupId);
    return g ? g.name : 'Standard';
  }

  public add() {
    if (!this.form.name?.trim()) return alert('Please enter customer name');
    const customerData = {
      name: this.form.name.trim(),
      contact: this.form.contact?.trim() || '',
      gst: this.form.gst?.trim() || '',
      address: this.form.address?.trim() || '',
      groupId: this.form.groupId || undefined,
    };

    if (this.editingId) {
      this.apiService.update(this.editingId, customerData).subscribe({
        next: () => {
          this.editingId = undefined;
          this.form = { name: '', contact: '', gst: '', address: '', groupId: '' };
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          alert('Failed to update customer: ' + (err?.error?.detail || err?.message || 'Server error'));
        },
      });
    } else {
      this.apiService.create(customerData).subscribe({
        next: () => {
          this.form = { name: '', contact: '', gst: '', address: '', groupId: '' };
        },
        error: (err) => {
          console.error('Error creating customer:', err);
          alert('Failed to create customer: ' + (err?.error?.detail || err?.message || 'Server error'));
        },
      });
    }
  }

  public remove(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    this.apiService.delete(id).subscribe({
      next: () => {
        console.log('Customer deleted from database');
      },
      error: (err) => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer: ' + (err?.error?.detail || err?.message || 'Server error'));
      },
    });
  }

  public edit(c: Customer) {
    this.editingId = c.id;
    this.form = { ...c };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public cancelEdit() {
    this.editingId = undefined;
    this.form = { name: '', contact: '', gst: '', address: '', groupId: '' };
  }
}
