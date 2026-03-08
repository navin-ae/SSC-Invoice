import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductApiService } from './product-api.service';
import { HttpClient } from '@angular/common/http';
import { productStore } from '../stores/product-store';
import { of, throwError } from 'rxjs';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpClient: HttpClient;

  beforeEach(() => {
    // Mock HttpClient
    httpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as any;

    // Create service with mocked HttpClient
    service = new ProductApiService();
    (service as any).http = httpClient;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('list()', () => {
    it('should fetch products from backend and sync with store', async () => {
      const mockBackendData = [
        { id: '1', name: 'Product A', hsn: 'HSN123', gst_rate: 18, prices: { c1: 100 } },
      ];

      vi.spyOn(httpClient, 'get').mockReturnValue(of(mockBackendData));
      vi.spyOn(productStore, 'setAll');

      return new Promise((resolve) => {
        service.list().subscribe((products) => {
          expect(products.length).toBe(1);
          expect(products[0].name).toBe('Product A');
          expect(products[0].gstRate).toBe(18);
          expect(productStore.setAll).toHaveBeenCalled();
          resolve(undefined);
        });
      });
    });

    it('should fallback to local store on error', async () => {
      vi.spyOn(httpClient, 'get').mockReturnValue(throwError(() => new Error('Network error')));
      vi.spyOn(productStore, 'products').mockReturnValue([
        { id: '1', name: 'Local Product', gstRate: 12, prices: {} },
      ]);

      return new Promise((resolve) => {
        service.list().subscribe((products) => {
          expect(products.length).toBe(1);
          expect(products[0].name).toBe('Local Product');
          resolve(undefined);
        });
      });
    });
  });

  describe('create()', () => {
    it('should create product on backend and sync with store', async () => {
      const newProduct = { name: 'New Product', hsn: 'HSN456', gstRate: 12, prices: {} };
      const mockResponse = { id: '2', name: 'New Product', hsn: 'HSN456', gst_rate: 12, prices: {} };

      vi.spyOn(httpClient, 'post').mockReturnValue(of(mockResponse));
      vi.spyOn(productStore, 'add').mockReturnValue('2');

      return new Promise((resolve) => {
        service.create(newProduct).subscribe((result) => {
          expect(result.id).toBe('2');
          expect(result.name).toBe('New Product');
          expect(result.gstRate).toBe(12);
          expect(productStore.add).toHaveBeenCalled();
          resolve(undefined);
        });
      });
    });

    it('should fallback to local store on error', async () => {
      const newProduct = { name: 'New Product', hsn: 'HSN456', gstRate: 12, prices: {} };

      vi.spyOn(httpClient, 'post').mockReturnValue(throwError(() => new Error('Network error')));
      vi.spyOn(productStore, 'add').mockReturnValue('fallback-id');

      return new Promise((resolve) => {
        service.create(newProduct).subscribe((result) => {
          expect(result.id).toBe('fallback-id');
          expect(result.name).toBe('New Product');
          expect(productStore.add).toHaveBeenCalledWith(newProduct);
          resolve(undefined);
        });
      });
    });
  });

  describe('delete()', () => {
    it('should delete product from backend and sync with store', async () => {
      vi.spyOn(httpClient, 'delete').mockReturnValue(of({ ok: true }));
      vi.spyOn(productStore, 'remove');

      return new Promise((resolve) => {
        service.delete('1').subscribe((result) => {
          expect(result.ok).toBe(true);
          expect(productStore.remove).toHaveBeenCalledWith('1');
          resolve(undefined);
        });
      });
    });

    it('should fallback to local store on error', async () => {
      vi.spyOn(httpClient, 'delete').mockReturnValue(throwError(() => new Error('Network error')));
      vi.spyOn(productStore, 'remove');

      return new Promise((resolve) => {
        service.delete('1').subscribe((result) => {
          expect(result.ok).toBe(true);
          expect(productStore.remove).toHaveBeenCalledWith('1');
          resolve(undefined);
        });
      });
    });
  });
});
