import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';
import { Product, productStore } from '../stores/product-store';

interface ProductBackendPayload {
  id?: string;
  name: string;
  hsn?: string;
  gst_rate?: number;
  prices: Record<string, number>;
}

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.base}/products`;

  /**
   * Fetch all products from backend.
   * On error, falls back to local store.
   */
  public list(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap((backendProducts) => {
        // Transform backend format to frontend format
        const transformed: Product[] = backendProducts.map((p) => ({
          id: p.id,
          name: p.name,
          hsn: p.hsn,
          gstRate: p.gst_rate,
          prices: p.prices || {},
        }));
        // Sync with local store
        productStore.setAll(transformed);
      }),
      catchError((error) => {
        console.warn('Failed to fetch products from backend, using local storage:', error);
        // Return local store data
        return of(productStore.products());
      })
    );
  }

  /**
   * Create a new product on backend.
   * On error, falls back to local store add.
   */
  public create(product: Omit<Product, 'id'>): Observable<Product> {
    const payload: ProductBackendPayload = {
      name: product.name,
      hsn: product.hsn,
      gst_rate: product.gstRate,
      prices: product.prices || {},
    };
console.log("Creating product with payload:", payload);
    return this.http.post<any>(this.apiUrl, payload).pipe(
      tap((response) => {
        const transformed: Product = {
          id: response.id,
          name: response.name,
          hsn: response.hsn,
          gstRate: response.gst_rate,
          prices: response.prices || {},
        };
        // Sync with local store
        productStore.add(transformed);
      }),
      catchError((error) => {
        console.warn('Failed to create product on backend, using local storage:', error);
        // Fall back to local store
        const id = productStore.add(product);
        return of({ ...product, id });
      })
    );
  }

  /**
   * Update an existing product on backend.
   * On error, falls back to local store update.
   */
  public update(id: string, product: Partial<Product>): Observable<Product> {
    const payload: Partial<ProductBackendPayload> = {};
    if (product.name !== undefined) payload.name = product.name;
    if (product.hsn !== undefined) payload.hsn = product.hsn;
    if (product.gstRate !== undefined) payload.gst_rate = product.gstRate;
    if (product.prices !== undefined) payload.prices = product.prices;

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((response) => {
        const transformed: Product = {
          id: response.id,
          name: response.name,
          hsn: response.hsn,
          gstRate: response.gst_rate,
          prices: response.prices || {},
        };
        // Sync with local store
        productStore.update(id, transformed);
      }),
      catchError((error) => {
        console.warn(`Failed to update product ${id} on backend, using local storage:`, error);
        // Fall back to local store
        productStore.update(id, product);
        const existing = productStore.products().find((p) => p.id === id);
        return of(existing || { id, ...product } as Product);
      })
    );
  }

  /**
   * Delete a product from backend.
   * On error, falls back to local store remove.
   */
  public delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Sync with local store
        productStore.remove(id);
      }),
      catchError((error) => {
        console.warn(`Failed to delete product ${id} on backend, using local storage:`, error);
        // Fall back to local store
        productStore.remove(id);
        return of({ ok: true });
      })
    );
  }
}
