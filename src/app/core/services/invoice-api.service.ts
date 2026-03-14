import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { Invoice, invoiceStore } from '../stores/invoice-store';

interface InvoiceItemBackend {
  id: string;
  productId: string;
  name: string;
  hsn?: string;
  qty: number;
  rate: number;
  gstRate: number;
  amount: number;
}

interface InvoiceBackendPayload {
  id?: string;
  invoiceNo?: string;
  date?: string;
  customerId?: string;
  customerName?: string;
  items: InvoiceItemBackend[];
  subtotal: number;
  totalGst: number;
  total: number;
}

interface InvoiceBackendResponse {
  id: string;
  invoice_no: string;
  date?: string;
  customer_id?: string;
  customer_name?: string;
  items: InvoiceItemBackend[];
  subtotal: number;
  total_gst: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceApiService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.base}/invoices`;

  /**
   * Fetch all invoices from backend.
   * In backend-only mode, always use database records.
   */
  public list(): Observable<Invoice[]> {
    return this.http.get<InvoiceBackendResponse[]>(this.apiUrl).pipe(
      tap((backendInvoices) => {
        const transformed: Invoice[] = backendInvoices.map((i) =>
          this.transformBackendToFrontend(i)
        );
        invoiceStore.setAll(transformed);
      }),
      catchError((error) => {
        console.error('Failed to fetch invoices from backend:', error);
        return throwError(() => error);
      })
    ) as Observable<Invoice[]>;
  }

  /**
   * Create a new invoice on backend.
   * Backend-only: always persisted via API. No local fallback.
   */
  public create(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
    const payload: InvoiceBackendPayload = {
      invoiceNo: invoice.invoiceNo,
      date: invoice.date,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      items: invoice.items,
      subtotal: invoice.subtotal,
      totalGst: invoice.totalGst,
      total: invoice.total,
    };

    return this.http.post<InvoiceBackendResponse>(this.apiUrl, payload).pipe(
      tap((response) => {
        const transformed = this.transformBackendToFrontend(response);
        invoiceStore.addFromBackend(transformed);
      }),
      catchError((error) => {
        console.error('Failed to create invoice on backend:', error);
        return throwError(() => error);
      })
    ) as Observable<Invoice>;
  }

  /**
   * Delete an invoice from backend.
   * On error, falls back to local store delete.
   */
  public delete(invoiceId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${invoiceId}`).pipe(
      tap(() => {
        invoiceStore.remove(invoiceId);
      }),
      catchError((error) => {
        console.error(`Failed to delete invoice ${invoiceId} on backend:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Transform backend response to frontend format.
   */
  private transformBackendToFrontend(response: InvoiceBackendResponse): Invoice {
    return {
      id: response.id,
      invoiceNo: response.invoice_no,
      date: response.date || '',
      customerId: response.customer_id,
      customerName: response.customer_name,
      items: response.items,
      subtotal: response.subtotal,
      totalGst: response.total_gst,
      total: response.total,
    };
  }
}
