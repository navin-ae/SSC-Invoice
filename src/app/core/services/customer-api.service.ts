import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { Customer, customerStore } from '../stores/customer-store';

interface CustomerBackendPayload {
  id?: string;
  customer_name: string;
  contact?: string;
  gst?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerApiService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.base}/customers`;

  /**
   * Fetch all customers from backend.
   * On error, falls back to local store.
   */
  list(): Observable<Customer[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((backendCustomers) => {
        const transformed: Customer[] = backendCustomers.map((c) => ({
          id: c.id,
          name: c.customer_name,
          contact: c.contact,
          gst: c.gst,
        }));
        customerStore.setAll(transformed);
      }),
      catchError((error) => {
        console.error('Failed to fetch customers from backend:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new customer on backend.
   * On error, falls back to local store add.
   */
  public create(customer: Omit<Customer, 'id'>): Observable<Customer> {
    const payload: CustomerBackendPayload = {
      customer_name: customer.name,
      contact: customer.contact,
      gst: customer.gst,
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      tap((response) => {
        const transformed: Customer = {
          id: response.id,
          name: response.customer_name,
          contact: response.contact,
          gst: response.gst,
        };
        customerStore.addFromBackend(transformed);
      }),
      catchError((error) => {
        console.error('Failed to create customer on backend:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing customer on backend.
   * On error, falls back to local store update.
   */
  update(id: string, customer: Partial<Customer>): Observable<Customer> {
    const payload: Partial<CustomerBackendPayload> = {};
    if (customer.name) payload.customer_name = customer.name;
    if (customer.contact !== undefined) payload.contact = customer.contact;
    if (customer.gst !== undefined) payload.gst = customer.gst;

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((response) => {
        const transformed: Customer = {
          id: response.id,
          name: response.customer_name,
          contact: response.contact,
          gst: response.gst,
        };
        customerStore.update(id, transformed);
      }),
      catchError((error) => {
        console.error(`Failed to update customer ${id} on backend:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a customer from backend.
   * On error, falls back to local store remove.
   */
  delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        customerStore.remove(id);
      }),
      catchError((error) => {
        console.error(`Failed to delete customer ${id} on backend:`, error);
        return throwError(() => error);
      })
    );
  }
}
