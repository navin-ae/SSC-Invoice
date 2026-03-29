import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { customerGroupStore } from '../../core/stores/customer-group';
import { customerStore } from '../../core/stores/customer-store';
import { AssignCustomersToGroupsComponent } from './assign-customers-to-groups.component';

@Component({
  selector: 'app-customer-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, AssignCustomersToGroupsComponent],
  templateUrl: './customer-groups.component.html',
  styleUrls: ['./customer-groups.component.scss']
})
export class CustomerGroupsComponent {
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
    customerGroupStore.add({ name: name.trim(), description: description?.trim() });
    this.formData = { name: '', description: '' };
    this.showAddForm.set(false);
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
      customerGroupStore.update(groupId, {
        name: this.formData.name.trim(),
        description: this.formData.description?.trim() || ''
      });
      this.cancelEdit();
    }
  }

  deleteGroup(groupId: string) {
    if (confirm('Delete this group? Customers will need to be reassigned.')) {
      customerGroupStore.remove(groupId);
    }
  }

  getCustomerCountForGroup(groupId: string): number {
    return this.customerStore.customers().filter(c => c.groupId === groupId).length;
  }
}
