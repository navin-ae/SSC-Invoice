import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { CustomerGroup, customerGroupStore } from '../stores/customer-group';

interface CustomerGroupBackendPayload {
  id?: string;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerGroupApiService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.base}/customer-groups`;

  /**
   * Fetch all customer groups from backend database.
   */
  list(): Observable<CustomerGroup[]> {
    return this.http.get<CustomerGroup[]>(this.apiUrl).pipe(
      tap((groups) => {
        customerGroupStore.setAll(groups);
      }),
      catchError((error) => {
        console.error('Failed to fetch customer groups from backend:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new customer group in backend database.
   */
  create(group: Omit<CustomerGroup, 'id'>): Observable<CustomerGroup> {
    const payload: CustomerGroupBackendPayload = {
      name: group.name,
      description: group.description,
    };

    return this.http.post<CustomerGroup>(this.apiUrl, payload).pipe(
      tap((response) => {
        customerGroupStore.addFromBackend(response);
      }),
      catchError((error) => {
        console.error('Failed to create customer group on backend:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing customer group in backend database.
   */
  update(id: string, group: Partial<CustomerGroup>): Observable<CustomerGroup> {
    const payload: Partial<CustomerGroupBackendPayload> = {};
    if (group.name !== undefined) payload.name = group.name;
    if (group.description !== undefined) payload.description = group.description;

    return this.http.put<CustomerGroup>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((response) => {
        customerGroupStore.update(id, response);
      }),
      catchError((error) => {
        console.error(`Failed to update customer group ${id} on backend:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a customer group from backend database.
   */
  delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        customerGroupStore.remove(id);
      }),
      catchError((error) => {
        console.error(`Failed to delete customer group ${id} on backend:`, error);
        return throwError(() => error);
      })
    );
  }
}
