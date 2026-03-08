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
        // Transform backend format to frontend format
        const transformed: Customer[] = backendCustomers.map((c) => ({
          id: c.id,
          name: c.customer_name,
          contact: c.contact,
          gst: c.gst,
        }));
        // Sync with local store
        customerStore.setAll(transformed);
      }),
      catchError((error) => {
        console.warn('Failed to fetch customers from backend, using local storage:', error);
        // Return local store data
        return of(customerStore.customers());
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
        // Sync with local store
        customerStore.add(transformed);
      }),
      catchError((error) => {
        console.warn('Failed to create customer on backend, using local storage:', error);
        // Fall back to local store
        const id = customerStore.add(customer);
        return of({ ...customer, id });
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
        // Sync with local store
        customerStore.update(id, transformed);
      }),
      catchError((error) => {
        console.warn(`Failed to update customer ${id} on backend, using local storage:`, error);
        // Fall back to local store
        customerStore.update(id, customer);
        const existing = customerStore.customers().find((c) => c.id === id);
        return of(existing || { id, ...customer } as Customer);
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
        // Sync with local store
        customerStore.remove(id);
      }),
      catchError((error) => {
        console.warn(`Failed to delete customer ${id} on backend, using local storage:`, error);
        // Fall back to local store
        customerStore.remove(id);
        return of({ ok: true });
      })
    );
  }
}
