import { Invoice } from '../stores/invoice-store';
import { customerStore } from '../stores/customer-store';

// dynamic imports to avoid bundling unless used at runtime
async function importXlsx() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  try {
    const mod = await import('xlsx');
    return mod;
  } catch (e) {
    throw new Error('xlsx library is not available (run npm install)');
  }
}

async function importJSZip() {
  try {
    const mod = await import('jszip');
    return mod;
  } catch (e) {
    throw new Error('jszip library is not available (run npm install)');
  }
}

// Convert invoice to a row suitable for XLSX/CSV export
function invoiceToRow(inv: Invoice) {
  const customer = customerStore.customers().find(c => c.id === inv.customerId);
  // approximate gst breakdown: split totalGst into cgst/sgst equally
  const cgst = (inv.totalGst || 0) / 2;
  const sgst = (inv.totalGst || 0) / 2;
  return {
    id: inv.id,
    invoiceNo: inv.invoiceNo,
    date: new Date(inv.date).toISOString(),
    customerId: inv.customerId ?? '',
    customerName: inv.customerName ?? '',
    customerGstin: customer?.gst ?? '',
    customerAddress: inv.customerAddress ?? '',
    subtotal: (inv.subtotal ?? 0).toFixed(2),
    totalGst: (inv.totalGst ?? 0).toFixed(2),
    cgst: cgst.toFixed(2),
    sgst: sgst.toFixed(2),
    total: (inv.total ?? 0).toFixed(2),
    items: JSON.stringify(inv.items || [])
  };
}

export async function exportInvoicesXlsx(invoices: Invoice[], filename = 'invoices.xlsx') {
  const xlsx = await importXlsx();
  const rows = invoices.map(invoiceToRow);
  const ws = xlsx.utils.json_to_sheet(rows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Invoices');
  const wopts = { bookType: 'xlsx', type: 'array' };
  const wbout = xlsx.write(wb, wopts);
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportGstr1Xlsx(invoices: Invoice[], filename = 'gstr1.xlsx') {
  const xlsx = await importXlsx();
  // map invoices to GSTR-1 style rows. This is a simplified template and may need to be adapted to CA requirements.
  const rows = invoices.map(inv => {
    const customer = customerStore.customers().find(c => c.id === inv.customerId);
    const gstin = customer?.gst ?? '';
    const invoiceType = gstin ? 'B2B' : 'B2C';
    const taxableValue = Number(inv.subtotal || 0);
    const totalGst = Number(inv.totalGst || 0);
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const igst = 0; // place-of-supply not tracked, defaulting to intrastate
    return {
      invoiceNo: inv.invoiceNo,
      invoiceDate: new Date(inv.date).toISOString().slice(0, 10), // YYYY-MM-DD
      invoiceType,
      gstin,
      customerName: inv.customerName ?? '',
      taxableValue: taxableValue.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      hsn: (inv.items && inv.items.length ? (inv.items[0].hsn ?? '') : ''),
      invoiceValue: Number(inv.total).toFixed(2)
    };
  });
  const ws = xlsx.utils.json_to_sheet(rows);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'GSTR1');
  const wopts = { bookType: 'xlsx', type: 'array' };
  const wbout = xlsx.write(wb, wopts);
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// generate PDF blob for an invoice using html2pdf and return Blob
async function generatePdfBlobForInvoice(inv: Invoice, filename?: string) {
  // reuse buildPrintable HTML from invoice-print file by dynamically constructing the document fragment
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { buildPrintable } = await import('./invoice-print');
  const html = buildPrintable(inv);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm';
  container.style.height = '297mm';
  container.style.overflow = 'hidden';
  container.innerHTML = html;
  document.body.appendChild(container);
  // wait for layout
  await new Promise<void>((r) => setTimeout(r, 700));

  // import html2pdf
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
    margin: [8, 8, 8, 8],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  try {
    // prefer the page wrapper
    const pageEl = container.querySelector('.page') || container;
    // the chain: toPdf().output('blob') is the most compatible approach
    const pdf = await html2pdf().from(pageEl as any).set(opt).toPdf().output('blob');
    return pdf as Blob;
  } finally {
    setTimeout(() => { try { document.body.removeChild(container); } catch {} }, 300);
  }
}

export async function exportInvoicesZip(invoices: Invoice[], filename = 'invoices.zip') {
  const JSZip = await importJSZip();
  const zip = new (JSZip as any)();
  for (const inv of invoices) {
    try {
      // generate blob
      // NOTE: to avoid blocking UI too long, generate sequentially
      // eslint-disable-next-line no-await-in-loop
      const blob = await generatePdfBlobForInvoice(inv, `${inv.invoiceNo}.pdf`);
      zip.file(`${inv.invoiceNo}.pdf`, blob);
    } catch (e) {
      console.error('Failed to generate PDF for', inv.invoiceNo, e);
    }
  }
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
