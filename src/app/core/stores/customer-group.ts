export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
}

import { signal } from '@angular/core';

const STORAGE_KEY = 'ssc_customer_groups_v1';

function readGroups(): CustomerGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function createCustomerGroupStore() {
  const groups = signal<CustomerGroup[]>(readGroups());

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups()));
  }

  function add(g: Omit<CustomerGroup, 'id'>) {
    const id = Date.now().toString(36);
    groups.set([...groups(), { ...g, id }]);
    persist();
    return id;
  }

  function update(id: string, patch: Partial<CustomerGroup>) {
    groups.set(groups().map(x => x.id === id ? { ...x, ...patch } : x));
    persist();
  }

  function remove(id: string) {
    groups.set(groups().filter(x => x.id !== id));
    persist();
  }

  function setAll(items: CustomerGroup[]) {
    groups.set(items);
    persist();
  }

  function clear() {
    groups.set([]);
    persist();
  }

  return { groups, add, update, remove, setAll, clear };
}

// singleton instance for app-wide usage
export const customerGroupStore = createCustomerGroupStore();
