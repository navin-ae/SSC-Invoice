import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore as store, Customer } from '../../core/stores/customer-store';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent {
  public customers = store.customers;

  public form: Partial<Customer> = { name: '' };
  public editingId?: string;

  public add() {
    if (!this.form.name) return alert('Name required');
    if (this.editingId) {
      store.update(this.editingId, { name: this.form.name! });
      this.editingId = undefined;
    } else {
      store.add({ name: this.form.name! });
    }
    this.form = { name: '' };
  }

  public remove(id: string) {
    if (!confirm('Delete customer?')) return;
    store.remove(id);
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
