import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerGroupStore } from '../../core/stores/customer-group';
import { customerStore } from '../../core/stores/customer-store';
import { CustomerGroupApiService } from '../../core/services/customer-group-api.service';
import { AssignCustomersToGroupsComponent } from './assign-customers-to-groups.component';

@Component({
  selector: 'app-customer-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, AssignCustomersToGroupsComponent],
  templateUrl: './customer-groups.component.html',
  styleUrls: ['./customer-groups.component.scss']
})
export class CustomerGroupsComponent {
  private groupApi = inject(CustomerGroupApiService);
  customerGroupStore = customerGroupStore;
  customerStore = customerStore;

  showAddForm = signal(false);
  editingGroupId = signal<string | null>(null);
  formData: { name: string; description: string } = { name: '', description: '' };

  toggleAddForm() {
    this.showAddForm.update(v => !v);
    if (!this.showAddForm()) {
      this.formData = { name: '', description: '' };
    }
  }

  addGroup() {
    const { name, description } = this.formData;
    if (!name.trim()) return;
    this.groupApi.create({ name: name.trim(), description: description?.trim() }).subscribe({
      next: () => {
        this.formData = { name: '', description: '' };
        this.showAddForm.set(false);
      },
      error: (err) => {
        alert('Failed to save group to database: ' + (err?.message || 'Unknown error'));
      }
    });
  }

  startEdit(group: any) {
    this.editingGroupId.set(group.id);
    this.formData = { name: group.name, description: group.description || '' };
  }

  cancelEdit() {
    this.editingGroupId.set(null);
    this.formData = { name: '', description: '' };
  }

  saveEdit(groupId: string) {
    if (this.formData.name?.trim()) {
      this.groupApi.update(groupId, {
        name: this.formData.name.trim(),
        description: this.formData.description?.trim() || ''
      }).subscribe({
        next: () => {
          this.cancelEdit();
        },
        error: (err) => {
          alert('Failed to update group: ' + (err?.message || 'Unknown error'));
        }
      });
    }
  }

  deleteGroup(groupId: string) {
    if (confirm('Delete this group? Customers will need to be reassigned.')) {
      this.groupApi.delete(groupId).subscribe({
        next: () => {
          console.log('Customer group deleted');
        },
        error: (err) => {
          alert('Failed to delete group: ' + (err?.message || 'Unknown error'));
        }
      });
    }
  }

  getCustomerCountForGroup(groupId: string): number {
    return this.customerStore.customers().filter(c => c.groupId === groupId).length;
  }
}
