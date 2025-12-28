import { customerStore } from '../stores/customer-store';
import { productStore } from '../stores/product-store';
import { invoiceStore } from '../stores/invoice-store';

export function exportAllData(): string {
  const data = {
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
    if (d.customers) {
      // replace customers
      localStorage.setItem('ssc_customers_v1', JSON.stringify(d.customers));
    }
    if (d.products) {
      localStorage.setItem('ssc_products_v1', JSON.stringify(d.products));
    }
    if (d.invoices) {
      localStorage.setItem('ssc_invoices_v1', JSON.stringify(d.invoices));
    }
    // reload stores by reloading page to ensure signals re-read
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
