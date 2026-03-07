import { Invoice } from '../stores/invoice-store';

export function exportInvoicesCsv(invoices: Invoice[], filename = 'invoices.csv') {
  const header = [
    'id',
    'invoiceNo',
    'date',
    'customerId',
    'customerName',
    'customerAddress',
    'subtotal',
    'totalGst',
    'total',
    'items'
  ];

  const rows = invoices.map(i => {
    const items = JSON.stringify(i.items || []);
    const cols = [
      i.id,
      i.invoiceNo,
      i.date,
      i.customerId ?? '',
      i.customerName ?? '',
      (i.customerAddress ?? '').replace(/\n/g, ' '),
      (i.subtotal ?? 0).toFixed(2),
      (i.totalGst ?? 0).toFixed(2),
      (i.total ?? 0).toFixed(2),
      items
    ];
    // escape double-quotes
    return cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
