
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';
import { Supplier } from '../models/supplier.model';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: {
    city: string;
  };
  company: {
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);

  private readonly apiUrl =
    'https://jsonplaceholder.typicode.com/users';

  private readonly storageKey = 'supplier-management-suppliers';

  getSuppliers(): Observable<Supplier[]> {
    const saved = this.readSavedSuppliers();

    if (saved !== null) {
      return of(saved);
    }

    return this.http.get<ApiUser[]>(this.apiUrl).pipe(
      map(users =>
        users.map(user => ({
          id: user.id,
          name: user.name,
          company: user.company.name,
          email: user.email,
          phone: user.phone,
          city: user.address.city
        }))
      ),
      tap(suppliers => this.saveSuppliers(suppliers))
    );
  }

  saveSuppliers(suppliers: Supplier[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(suppliers)
    );
  }

  private readSavedSuppliers(): Supplier[] | null {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (stored === null) {
        return null;
      }

      const parsed: unknown = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed as Supplier[] : null;
    } catch {
      return null;
    }
  }
}
