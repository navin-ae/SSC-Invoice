import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CustomerApiService } from './customer-api.service';
import { HttpClient } from '@angular/common/http';
import { customerStore } from '../stores/customer-store';
import { of, throwError } from 'rxjs';

describe('CustomerApiService', () => {
  let service: CustomerApiService;
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
    service = new CustomerApiService();
    (service as any).http = httpClient;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('list()', () => {
    it('should fetch customers from backend and sync with store', async () => {
      const mockBackendData = [
        { id: '1', customer_name: 'John', contact: '123', gst: 'GST123' },
      ];

      vi.spyOn(httpClient, 'get').mockReturnValue(of(mockBackendData));
      vi.spyOn(customerStore, 'setAll');

      return new Promise((resolve) => {
        service.list().subscribe((customers) => {
          expect(customers.length).toBe(1);
          expect(customers[0].name).toBe('John');
          expect(customerStore.setAll).toHaveBeenCalled();
          resolve(undefined);
        });
      });
    });

    it('should fallback to local store on error', async () => {
      vi.spyOn(httpClient, 'get').mockReturnValue(throwError(() => new Error('Network error')));
      vi.spyOn(customerStore, 'customers').mockReturnValue([
        { id: '1', name: 'Local', contact: '123' },
      ]);

      return new Promise((resolve) => {
        service.list().subscribe((customers) => {
          expect(customers.length).toBe(1);
          expect(customers[0].name).toBe('Local');
          resolve(undefined);
        });
      });
    });
  });

  describe('create()', () => {
    it('should create customer on backend and sync with store', async () => {
      const newCustomer = { name: 'Jane', contact: '456', gst: 'GST456' };
      const mockResponse = { id: '2', customer_name: 'Jane', contact: '456', gst: 'GST456' };

      vi.spyOn(httpClient, 'post').mockReturnValue(of(mockResponse));
      vi.spyOn(customerStore, 'add').mockReturnValue('2');

      return new Promise((resolve) => {
        service.create(newCustomer).subscribe((result) => {
          expect(result.id).toBe('2');
          expect(result.name).toBe('Jane');
          expect(customerStore.add).toHaveBeenCalled();
          resolve(undefined);
        });
      });
    });

    it('should fallback to local store on error', async () => {
      const newCustomer = { name: 'Jane', contact: '456' };

      vi.spyOn(httpClient, 'post').mockReturnValue(throwError(() => new Error('Network error')));
      vi.spyOn(customerStore, 'add').mockReturnValue('fallback-id');

      return new Promise((resolve) => {
        service.create(newCustomer).subscribe((result) => {
          expect(result.id).toBe('fallback-id');
          expect(result.name).toBe('Jane');
          expect(customerStore.add).toHaveBeenCalledWith(newCustomer);
          resolve(undefined);
        });
      });
    });
  });

  describe('delete()', () => {
    it('should delete customer from backend and sync with store', async () => {
      vi.spyOn(httpClient, 'delete').mockReturnValue(of({ ok: true }));
      vi.spyOn(customerStore, 'remove');

      return new Promise((resolve) => {
        service.delete('1').subscribe((result) => {
          expect(result.ok).toBe(true);
          expect(customerStore.remove).toHaveBeenCalledWith('1');
          resolve(undefined);
        });
      });
    });

    it('should fallback to local store on error', async () => {
      vi.spyOn(httpClient, 'delete').mockReturnValue(throwError(() => new Error('Network error')));
      vi.spyOn(customerStore, 'remove');

      return new Promise((resolve) => {
        service.delete('1').subscribe((result) => {
          expect(result.ok).toBe(true);
          expect(customerStore.remove).toHaveBeenCalledWith('1');
          resolve(undefined);
        });
      });
    });
  });
});
