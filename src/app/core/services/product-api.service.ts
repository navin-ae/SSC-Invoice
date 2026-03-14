import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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
        const transformed: Product[] = backendProducts.map((p) => ({
          id: p.id,
          name: p.name,
          hsn: p.hsn,
          gstRate: p.gst_rate,
          prices: p.prices || {},
        }));
        productStore.setAll(transformed);
      }),
      catchError((error) => {
        console.error('Failed to fetch products from backend:', error);
        return throwError(() => error);
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
        productStore.addFromBackend(transformed);
      }),
      catchError((error) => {
        console.error('Failed to create product on backend:', error);
        return throwError(() => error);
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
        productStore.update(id, transformed);
      }),
      catchError((error) => {
        console.error(`Failed to update product ${id} on backend:`, error);
        return throwError(() => error);
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
        productStore.remove(id);
      }),
      catchError((error) => {
        console.error(`Failed to delete product ${id} on backend:`, error);
        return throwError(() => error);
      })
    );
  }
}
