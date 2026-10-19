import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
  customerAddress?: string;
  items: InvoiceItemBackend[];
  subtotal: number;
  totalGst: number;
  total: number;
}

interface InvoiceBackendResponse {
  id: string;
  invoiceNo?: string;
  invoice_no?: string;
  date?: string;
  customerId?: string;
  customer_id?: string;
  customerName?: string;
  customer_name?: string;
  customerAddress?: string;
  customer_address?: string;
  items: InvoiceItemBackend[];
  subtotal: number;
  totalGst?: number;
  total_gst?: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceApiService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.base}/invoices`;

  /**
   * Fetch all invoices from backend database.
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
   * Create a new invoice on backend database.
   */
  public create(invoice: Omit<Invoice, 'id'>): Observable<Invoice> {
    const payload: InvoiceBackendPayload = {
      invoiceNo: invoice.invoiceNo,
      date: invoice.date,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      customerAddress: invoice.customerAddress,
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
   * Delete an invoice from backend database.
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
   * Transform backend response to frontend format, handling both camelCase and snake_case keys.
   */
  private transformBackendToFrontend(response: any): Invoice {
    return {
      id: response.id,
      invoiceNo: response.invoiceNo || response.invoice_no || '',
      date: response.date || '',
      customerId: response.customerId || response.customer_id,
      customerName: response.customerName || response.customer_name,
      customerAddress: response.customerAddress || response.customer_address,
      items: response.items || [],
      subtotal: response.subtotal ?? 0,
      totalGst: response.totalGst ?? response.total_gst ?? 0,
      total: response.total ?? 0,
    };
  }
}
