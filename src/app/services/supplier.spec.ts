
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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

  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  getSuppliers(): Observable<Supplier[]> {
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
      )
    );
  }
}
