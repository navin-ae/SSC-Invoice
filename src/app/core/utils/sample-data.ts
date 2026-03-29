import { customerStore } from '../stores/customer-store';
import { productStore } from '../stores/product-store';
import { customerGroupStore } from '../stores/customer-group';

export function seedSampleData(count = 30) {
  // Initialize customer groups if empty
  if (customerGroupStore.groups().length === 0) {
    const retailGroupId = customerGroupStore.add({ name: 'Retail', description: 'Walk-in retail customers' });
    const wholesaleGroupId = customerGroupStore.add({ name: 'Wholesale', description: 'Bulk wholesale customers' });
    
    // Initialize customers if empty
    if (customerStore.customers().length === 0) {
      customerStore.add({ name: 'Walk-in Retail', groupId: retailGroupId });
      customerStore.add({ name: 'Default Wholesale', groupId: wholesaleGroupId });
    }
  }

  const existing = productStore.products();
  if (existing.length > 5) return;

  // Create sample products with prices per group (not per customer)
  const groups = customerGroupStore.groups();
  for (let i = 1; i <= count; i++) {
    const prices: Record<string, number> = {};
    groups.forEach(g => {
      prices[g.id] = Math.round(10 + Math.random() * 90);
    });
    productStore.add({
      name: `Sample Product ${i}`,
      hsn: '490199',
      gstRate: 12,
      prices
    });
  }
}
