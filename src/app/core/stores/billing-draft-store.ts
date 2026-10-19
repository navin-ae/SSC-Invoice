import { signal } from '@angular/core';
import { InvoiceItem } from './invoice-store';

export interface BillingDraft {
  items: InvoiceItem[];
  selectedCustomerId: string | null;
  isTemporaryCustomer: boolean;
  temporaryCustomerName: string;
  temporaryCustomerPhone: string;
  temporaryCustomerAddress: string;
  temporaryCustomerGroupId: string;
  saveTemporaryCustomerToDirectory: boolean;
}

const STORAGE_KEY = 'ssc_billing_active_draft_v1';

const DEFAULT_DRAFT: BillingDraft = {
  items: [],
  selectedCustomerId: null,
  isTemporaryCustomer: false,
  temporaryCustomerName: '',
  temporaryCustomerPhone: '',
  temporaryCustomerAddress: '',
  temporaryCustomerGroupId: '',
  saveTemporaryCustomerToDirectory: false,
};

function readDraft(): BillingDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DRAFT };
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      selectedCustomerId: parsed.selectedCustomerId !== undefined ? parsed.selectedCustomerId : null,
      isTemporaryCustomer: Boolean(parsed.isTemporaryCustomer),
      temporaryCustomerName: parsed.temporaryCustomerName || '',
      temporaryCustomerPhone: parsed.temporaryCustomerPhone || '',
      temporaryCustomerAddress: parsed.temporaryCustomerAddress || '',
      temporaryCustomerGroupId: parsed.temporaryCustomerGroupId || '',
      saveTemporaryCustomerToDirectory: Boolean(parsed.saveTemporaryCustomerToDirectory),
    };
  } catch {
    return { ...DEFAULT_DRAFT };
  }
}

function persistDraft(draft: BillingDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('Failed to persist billing draft:', e);
  }
}

export function createBillingDraftStore() {
  const draft = signal<BillingDraft>(readDraft());

  function setDraft(patch: Partial<BillingDraft>) {
    draft.update(current => {
      const updated = { ...current, ...patch };
      persistDraft(updated);
      return updated;
    });
  }

  function clearDraft(defaultCustomerId: string | null = null) {
    const fresh: BillingDraft = {
      ...DEFAULT_DRAFT,
      selectedCustomerId: defaultCustomerId,
    };
    draft.set(fresh);
    persistDraft(fresh);
  }

  return {
    draft,
    setDraft,
    clearDraft,
  };
}

export const billingDraftStore = createBillingDraftStore();
