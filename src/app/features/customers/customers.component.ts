import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore as store, Customer } from '../../core/stores/customer-store';
import { HttpClient } from '@angular/common/http';
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
export class CustomersComponent {
  public customers = store.customers;

  public form: Partial<Customer> = { name: '' };
  public editingId?: string;
  private httpService=inject(HttpClient);

  public add() {
    if (!this.form.name) return alert('Name required');
    if (this.editingId) {
      store.update(this.editingId, { name: this.form.name! });
      this.editingId = undefined;
    } else {
      // const data={ customer_name: this.form.name };
    
      // this.httpService.post<Customer>('http://127.0.0.1:8000/api/customers', data).subscribe(response => {
      //   console.log('Customer added via backend:', response);
      // });
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
