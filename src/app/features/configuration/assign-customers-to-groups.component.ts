import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore } from '../../core/stores/customer-store';
import { customerGroupStore } from '../../core/stores/customer-group';

@Component({
  selector: 'app-assign-customers-to-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assign-container">
      <div class="assign-instructions">
        <p>Select customers below and assign them to a group. Customers can belong to only one group at a time.</p>
      </div>

      <div class="assign-controls">
        <div class="control-group">
          <label>Select Group to Assign:</label>
          <select [(ngModel)]="selectedGroupId" class="form-select">
            <option value="">-- Choose a group --</option>
            @for (group of customerGroupStore.groups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
        </div>
        <button 
          (click)="bulkAssignSelected()" 
          class="btn btn-primary"
          [disabled]="!selectedGroupId || selectedCustomers().size === 0"
        >
          Assign Selected ({{ selectedCustomers().size }})
        </button>
      </div>

      <!-- Customers List -->
      <div class="customers-table">
        @if (customerStore.customers().length === 0) {
          <p class="info-text">No customers yet. Add customers first.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    [(ngModel)]="allSelected"
                    (change)="toggleSelectAll()"
                  />
                </th>
                <th>Name</th>
                <th>Contact</th>
                <th>Current Group</th>
              </tr>
            </thead>
            <tbody>
              @for (customer of customerStore.customers(); track customer.id) {
                <tr [class.selected]="selectedCustomers().has(customer.id)">
                  <td>
                    <input 
                      type="checkbox" 
                      [checked]="selectedCustomers().has(customer.id)"
                      (change)="toggleCustomer(customer.id)"
                    />
                  </td>
                  <td class="name-cell">{{ customer.name }}</td>
                  <td>{{ customer.contact || '-' }}</td>
                  <td class="group-cell">
                    <span class="group-badge" *ngIf="getGroupName(customer.groupId)">
                      {{ getGroupName(customer.groupId) }}
                    </span>
                    <span class="no-group" *ngIf="!customer.groupId">No group</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Individual Assignment Section -->
      <div class="individual-assignment">
        <h4>Quick Assign Individual Customer</h4>
        <div class="quick-assign-controls">
          <select [(ngModel)]="quickSelectCustomerId" class="form-select">
            <option value="">-- Choose a customer --</option>
            @for (customer of customerStore.customers(); track customer.id) {
              <option [value]="customer.id">{{ customer.name }}</option>
            }
          </select>
          <select [(ngModel)]="quickSelectGroupId" class="form-select">
            <option value="">-- Choose a group --</option>
            @for (group of customerGroupStore.groups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
          <button 
            (click)="quickAssignCustomer()" 
            class="btn btn-success"
            [disabled]="!quickSelectCustomerId || !quickSelectGroupId"
          >
            Assign
          </button>
        </div>
      </div>

      @if (successMessage()) {
        <div class="alert alert-success">
          {{ successMessage() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .assign-container {
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
    }

    .assign-instructions {
      background-color: #e7f3ff;
      border-left: 4px solid #0055cc;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .assign-instructions p {
      margin: 0;
      color: #0055cc;
    }

    .assign-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      align-items: flex-end;
    }

    .control-group {
      flex: 1;
    }

    .control-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }

    .form-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background-color: white;
      cursor: pointer;
    }

    .form-select:focus {
      outline: none;
      border-color: #0055cc;
      box-shadow: 0 0 0 3px rgba(0, 85, 204, 0.1);
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #0055cc;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0044aa;
    }

    .btn-primary:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-success:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .customers-table {
      margin-bottom: 24px;
    }

    .info-text {
      text-align: center;
      color: #666;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    thead {
      background-color: #f8f9fa;
      border-bottom: 2px solid #ddd;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
    }

    th:first-child {
      width: 50px;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    tbody tr {
      background-color: white;
    }

    tbody tr:hover {
      background-color: #f8f9fa;
    }

    tbody tr.selected {
      background-color: #e7f3ff;
    }

    input[type="checkbox"] {
      cursor: pointer;
    }

    .name-cell {
      font-weight: 500;
      color: #333;
    }

    .group-cell {
      text-align: center;
    }

    .group-badge {
      display: inline-block;
      background-color: #0055cc;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .no-group {
      color: #999;
      font-style: italic;
      font-size: 12px;
    }

    .individual-assignment {
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 4px;
      margin-top: 24px;
    }

    .individual-assignment h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 14px;
    }

    .quick-assign-controls {
      display: flex;
      gap: 12px;
    }

    .quick-assign-controls select {
      flex: 1;
    }

    .alert {
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
      font-size: 14px;
    }

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
  `]
})
export class AssignCustomersToGroupsComponent {
  customerStore = customerStore;
  customerGroupStore = customerGroupStore;

  selectedCustomers = signal<Set<string>>(new Set());
  selectedGroupId = signal('');
  allSelected = false;

  quickSelectCustomerId = signal('');
  quickSelectGroupId = signal('');

  successMessage = signal('');

  toggleCustomer(customerId: string) {
    const selected = new Set(this.selectedCustomers());
    if (selected.has(customerId)) {
      selected.delete(customerId);
    } else {
      selected.add(customerId);
    }
    this.selectedCustomers.set(selected);
    this.updateAllSelectedState();
  }

  toggleSelectAll() {
    const selected = new Set<string>();
    if (this.allSelected) {
      this.customerStore.customers().forEach(c => selected.add(c.id));
    }
    this.selectedCustomers.set(selected);
  }

  private updateAllSelectedState() {
    const selected = this.selectedCustomers().size;
    const total = this.customerStore.customers().length;
    this.allSelected = selected === total && total > 0;
  }

  bulkAssignSelected() {
    const groupId = this.selectedGroupId();
    if (!groupId) return;

    let count = 0;
    this.selectedCustomers().forEach(customerId => {
      this.customerStore.update(customerId, { groupId });
      count++;
    });

    this.selectedCustomers.set(new Set());
    this.selectedGroupId.set('');
    this.allSelected = false;
    
    this.showSuccess(`Assigned ${count} customer(s) to group`);
  }

  quickAssignCustomer() {
    const customerId = this.quickSelectCustomerId();
    const groupId = this.quickSelectGroupId();
    
    if (!customerId || !groupId) return;

    this.customerStore.update(customerId, { groupId });
    const customerName = this.customerStore.customers().find(c => c.id === customerId)?.name;
    const groupName = this.customerGroupStore.groups().find(g => g.id === groupId)?.name;
    
    this.quickSelectCustomerId.set('');
    this.quickSelectGroupId.set('');
    
    this.showSuccess(`Assigned ${customerName} to ${groupName}`);
  }

  getGroupName(groupId?: string): string | null {
    if (!groupId) return null;
    return this.customerGroupStore.groups().find(g => g.id === groupId)?.name || null;
  }

  private showSuccess(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}
