import { Invoice, InvoiceItem } from '../stores/invoice-store';

export function amountInWords(n: number) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function inWords(num: number): string {
    if (num === 0) return 'Zero';
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
    if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + inWords(num % 100) : '');
    if (num < 100000) return inWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + inWords(num % 1000) : '');
    if (num < 10000000) return inWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + inWords(num % 100000) : '');
    return inWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + inWords(num % 10000000) : '');
  }
  const x = Math.round(n);
  return inWords(x) + ' Only';
}

function computeGstBreakdown(items: InvoiceItem[]) {
  const breakdown: Record<string, { taxable: number; cgst: number; sgst: number; totalGst: number }> = {};
  for (const item of items) {
    const rate = item.gstRate;
    if (!breakdown[rate]) {
      breakdown[rate] = { taxable: 0, cgst: 0, sgst: 0, totalGst: 0 };
    }
    const perUnitTaxable = item.rate / (1 + (item.gstRate / 100));
    const taxable = perUnitTaxable * item.qty;
    const totalGst = item.amount - taxable;
    breakdown[rate].taxable += taxable;
    breakdown[rate].totalGst += totalGst;
    breakdown[rate].cgst += totalGst / 2;
    breakdown[rate].sgst += totalGst / 2;
  }
  return Object.entries(breakdown).map(([rate, values]) => ({ rate: +rate, ...values }));
}

export function buildPrintable(inv: Invoice) {
  const shop = {
    name: 'RAAJAMANI TRADERSS',
    addr1: '192, Kovai Road',
    addr2: 'Annur - PIN-641653',
    gstin: 'GSTIN: 33AAGPE8531J1ZT',
    phone: 'Phone: 9994813066'
  };

  const rows = inv.items.map((i, idx) => {
    return `<tr>
      <td style="text-align:center">${idx + 1}</td>
      <td>${i.name}</td>
      <td style="text-align:center">${i.hsn ?? ''}</td>
      <td style="text-align:center">${i.gstRate}%</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="text-align:right">₹${i.rate.toFixed(2)}</td>
      <td style="text-align:right">₹${i.amount.toFixed(2)}</td>
    </tr>`;
  }).join('');

  const gstBreakdown = computeGstBreakdown(inv.items);
  const gstBreakdownHtml = `
    <div style="flex: 1;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #ccc;">
        <thead>
          <tr>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">GST Rate</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">Taxable</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">CGST</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">SGST</th>
            <th style="border: 1px solid #ccc; padding: 4px; background-color: #f2f2f2;">Total GST</th>
          </tr>
        </thead>
        <tbody>
          ${gstBreakdown.map(item => `
            <tr>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: center;">${item.rate}%</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">₹${item.taxable.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">₹${item.cgst.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">₹${item.sgst.toFixed(2)}</td>
              <td style="border: 1px solid #ccc; padding: 4px; text-align: right;">₹${item.totalGst.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const cgst = inv.totalGst / 2;
  const sgst = inv.totalGst / 2;

  const summaryHtml = `
    <tr><td>Taxable Value</td><td style="text-align:right">₹${inv.subtotal.toFixed(2)}</td></tr>
    <tr><td>CGST</td><td style="text-align:right">₹${cgst.toFixed(2)}</td></tr>
    <tr><td>SGST</td><td style="text-align:right">₹${sgst.toFixed(2)}</td></tr>
    <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>₹${inv.total.toFixed(2)}</strong></td></tr>
  `;

  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice</title><style>
    @page { size: A4 portrait; margin: 8mm; }
    body{font-family:Arial;padding:10px;color:#111;max-width:148mm;margin:0 auto}
    .header{display:flex;justify-content:space-between;margin-bottom:12px}
    .seller{font-weight:normal}
    .seller .name{font-weight:700}
    table{width:100%;border-collapse:separate;border-spacing:0}
    th,td{padding:6px;font-size:13px;border-top:0;border-bottom:0;border-left:1px solid #ccc;border-right:1px solid #ccc}
    thead th{border-top:1px solid #ccc; border-bottom:1px solid #ccc}
    tr th:first-child, tr td:first-child{border-left:1px solid #ccc}
    tr th:last-child, tr td:last-child{border-right:1px solid #ccc}
    tbody tr:last-child td{border-bottom:1px solid #ccc}
    .right-table{width:300px;border:0;margin-left:auto;border-collapse:separate}
    .right-table td{border-left:1px solid #ddd;border-right:1px solid #ddd;border-top:0;border-bottom:0;padding:6px}
    .right-table tr:last-child td{border-bottom:1px solid #ddd}
    .no-border td{border:0;padding:2px}
  </style></head><body>
    <div class="header">
      <div class="seller">
        <div class="name" style="font-size:16px">${shop.name}</div>
        <div>${shop.addr1}</div>
        <div>${shop.addr2}</div>
        <div>${shop.gstin}</div>
        <div>${shop.phone}</div>
      </div>
      <div class="inv-meta" style="text-align:right">
        <div>Invoice No: <strong>${inv.invoiceNo}</strong></div>
        <div>Date: ${new Date(inv.date).toLocaleDateString()}</div>
        <div>Time: ${new Date(inv.date).toLocaleTimeString()}</div>
        <div>Bill To: ${inv.customerName ?? 'Walk-in'}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px">S.No</th>
          <th>Description</th>
          <th style="width:80px">HSN/SAC</th>
          <th style="width:60px">GST</th>
          <th style="width:60px">Qty</th>
          <th style="width:100px">Rate</th>
          <th style="width:120px">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div style="display:flex;margin-top:8px; align-items: flex-start;">
      ${gstBreakdownHtml}
      <div style="width:320px; margin-left: 10px;">
        <table class="right-table">
          <tbody>
            ${summaryHtml}
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top:12px;font-size:12px">Amount in words: INR ${amountInWords(inv.total)}</div>
  </body></html>`;
}

export async function exportInvoicePdf(inv: Invoice, filename?: string) {
  const html = buildPrintable(inv);
  // create an offscreen iframe so styles in head are applied
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.width = '800';
  iframe.height = '1100';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
  if (!doc) throw new Error('Unable to access iframe document');
  doc.open();
  doc.write(html);
  doc.close();

  // wait briefly for styles to apply and layout to stabilise
  await new Promise<void>((resolve) => setTimeout(resolve, 250));

  // dynamic import of html2pdf.js
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let html2pdf: any;
  try {
    const mod = await import('html2pdf.js');
    html2pdf = (mod && (mod as any).default) ? (mod as any).default : mod;
  } catch (e) {
    html2pdf = (window as any).html2pdf;
  }
  if (!html2pdf) throw new Error('html2pdf library not available');

  const opt = {
    filename: filename || `${inv.invoiceNo}.pdf`,
    margin: 8,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().from(iframe.contentWindow!.document.body).set(opt).save();
  } finally {
    // remove iframe
    setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 300);
  }
}

