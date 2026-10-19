import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerStore } from '../../core/stores/customer-store';
import { customerGroupStore } from '../../core/stores/customer-group';
import { CustomerApiService } from '../../core/services/customer-api.service';

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
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
    }

    .assign-instructions {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 0.92rem;
    }

    .assign-instructions p {
      margin: 0;
      color: #1e40af;
      font-weight: 500;
    }

    .assign-controls {
      display: flex;
      gap: 14px;
      margin-bottom: 22px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .control-group {
      flex: 1;
      min-width: 220px;
    }

    .control-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      font-size: 0.88rem;
      color: #334155;
    }

    .form-select {
      width: 100%;
      height: 42px;
      padding: 8px 12px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.92rem;
      background-color: #ffffff;
      color: #0f172a;
      cursor: pointer;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .form-select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .btn {
      height: 42px;
      padding: 0 18px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.92rem;
      font-weight: 600;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary {
      background-color: #2563eb;
      color: white;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background-color: #cbd5e1;
      color: #64748b;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-success {
      background-color: #16a34a;
      color: white;
      box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);
    }

    .btn-success:hover:not(:disabled) {
      background-color: #15803d;
      transform: translateY(-1px);
    }

    .btn-success:disabled {
      background-color: #cbd5e1;
      color: #64748b;
      cursor: not-allowed;
      box-shadow: none;
    }

    .customers-table {
      margin-bottom: 24px;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }

    .info-text {
      text-align: center;
      color: #64748b;
      padding: 24px;
      background-color: #f8fafc;
      margin: 0;
      font-size: 0.95rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.92rem;
    }

    thead {
      background-color: #f8fafc;
      border-bottom: 1.5px solid #e2e8f0;
    }

    th {
      padding: 12px 14px;
      text-align: left;
      font-weight: 700;
      color: #334155;
    }

    th:first-child {
      width: 44px;
      text-align: center;
    }

    td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    td:first-child {
      text-align: center;
    }

    tbody tr {
      background-color: white;
      transition: background 0.15s ease;
    }

    tbody tr:hover {
      background-color: #f8fafc;
    }

    tbody tr.selected {
      background-color: #eff6ff;
    }

    input[type="checkbox"] {
      cursor: pointer;
      width: 18px;
      height: 18px;
      accent-color: #2563eb;
    }

    .name-cell {
      font-weight: 600;
      color: #0f172a;
    }

    .group-cell {
      text-align: left;
    }

    .group-badge {
      display: inline-block;
      background-color: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .no-group {
      color: #94a3b8;
      font-style: italic;
      font-size: 0.82rem;
    }

    .individual-assignment {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 18px;
      border-radius: 10px;
      margin-top: 24px;
    }

    .individual-assignment h4 {
      margin: 0 0 12px 0;
      color: #0f172a;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .quick-assign-controls {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .quick-assign-controls select {
      flex: 1;
      min-width: 180px;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .alert-success {
      background-color: #f0fdf4;
      color: #15803d;
      border: 1px solid #86efac;
    }
  `]
})
export class AssignCustomersToGroupsComponent {
  private customerApi = inject(CustomerApiService);
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
      this.customerApi.update(customerId, { groupId }).subscribe({
        error: (err) => console.error(`Failed to assign customer ${customerId} to group:`, err)
      });
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

    this.customerApi.update(customerId, { groupId }).subscribe({
      next: () => {
        const customerName = this.customerStore.customers().find(c => c.id === customerId)?.name;
        const groupName = this.customerGroupStore.groups().find(g => g.id === groupId)?.name;
        this.showSuccess(`Assigned ${customerName} to ${groupName}`);
      },
      error: (err) => console.error(`Failed to assign customer ${customerId} to group:`, err)
    });
    
    this.quickSelectCustomerId.set('');
    this.quickSelectGroupId.set('');
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
