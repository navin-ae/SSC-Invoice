import { customerStore } from '../stores/customer-store';
import { productStore } from '../stores/product-store';
import { invoiceStore } from '../stores/invoice-store';
import { customerGroupStore } from '../stores/customer-group';
import { API_CONFIG } from '../config/api.config';

export async function exportAllData(): Promise<string> {
  try {
    const res = await fetch(`${API_CONFIG.base}/backup`);
    if (res.ok) {
      const data = await res.json();
      return JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.warn('Backend backup export failed, falling back to local stores:', err);
  }

  const data = {
    customerGroups: customerGroupStore.groups(),
    customers: customerStore.customers(),
    products: productStore.products(),
    invoices: invoiceStore.list()
  };
  return JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2);
}

export async function importAllData(fileContent: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(fileContent);
    const d = parsed.data ?? parsed;

    try {
      const payload: any = {};
      if (d.customerGroups) payload.customerGroups = d.customerGroups;
      if (d.customers) {
        payload.customers = d.customers.map((c: any) => ({
          id: c.id,
          customer_name: c.name || c.customer_name,
          contact: c.contact,
          gst: c.gst,
          address: c.address,
          group_id: c.groupId || c.group_id,
        }));
      }
      if (d.products) {
        payload.products = d.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          hsn: p.hsn,
          gst_rate: p.gstRate ?? p.gst_rate,
          prices: p.prices || {},
        }));
      }
      if (d.invoices) {
        payload.invoices = d.invoices.map((inv: any) => ({
          id: inv.id,
          invoiceNo: inv.invoiceNo || inv.invoice_no,
          date: inv.date,
          customerId: inv.customerId || inv.customer_id,
          customerName: inv.customerName || inv.customer_name,
          customerAddress: inv.customerAddress || inv.customer_address,
          items: inv.items || [],
          subtotal: inv.subtotal,
          totalGst: inv.totalGst ?? inv.total_gst,
          total: inv.total,
        }));
      }

      await fetch(`${API_CONFIG.base}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Backend restore fetch failed:', err);
    }

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
    console.error('Failed to parse and import backup:', e);
    return false;
  }
}
