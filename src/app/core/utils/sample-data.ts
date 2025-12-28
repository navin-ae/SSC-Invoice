import { customerStore } from '../stores/customer-store';
import { productStore } from '../stores/product-store';

export function seedSampleData(count = 30) {
  if (customerStore.customers().length === 0) {
    customerStore.add({ name: 'Walk-in Retail' });
    customerStore.add({ name: 'Default Wholesale' });
  }

  const existing = productStore.products();
  if (existing.length > 5) return;

  for (let i = 1; i <= count; i++) {
    // build a price map per customer id
    const prices: Record<string, number> = {};
    customerStore.customers().forEach(c => {
      prices[c.id] = Math.round(10 + Math.random() * 90);
    });
    productStore.add({
      name: `Sample Product ${i}`,
      hsn: '490199',
      gstRate: 12,
      prices
    });
  }
}
