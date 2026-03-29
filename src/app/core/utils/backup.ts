import { customerStore } from '../stores/customer-store';
import { productStore } from '../stores/product-store';
import { invoiceStore } from '../stores/invoice-store';
import { customerGroupStore } from '../stores/customer-group';

export function exportAllData(): string {
  const data = {
    customerGroups: customerGroupStore.groups(),
    customers: customerStore.customers(),
    products: productStore.products(),
    invoices: invoiceStore.list()
  };
  return JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2);
}

export async function importAllData(fileContent: string) {
  try {
    const parsed = JSON.parse(fileContent);
    const d = parsed.data ?? parsed;
    if (d.customerGroups) {
      customerGroupStore.setAll(d.customerGroups);
    }
    if (d.customers) {
      customerStore.setAll(d.customers);
    }
    if (d.products) {
      productStore.setAll(d.products);
    }
    if (d.invoices) {
      invoiceStore.setAll(d.invoices);
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
