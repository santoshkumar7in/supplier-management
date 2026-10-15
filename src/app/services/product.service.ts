
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { Product } from '../models/product.model';

interface ApiPost {
  id: number;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  private readonly storageKey = 'supplier-management-products';

  getProducts(): Observable<Product[]> {
    // 1. Check whether products are already saved in the browser.
    const savedProducts = this.readSavedProducts();

    if (savedProducts !== null) {
      return of(savedProducts);
    }

    // 2. If no saved products exist, fetch them from the API.
    return this.http.get<ApiPost[]>(this.apiUrl).pipe(
      map(posts =>
        posts.map(post => ({
          id: post.id,
          name: post.title,
          description: post.body,
          price: Number((100 + post.id * 12.5).toFixed(2)),
          quantity: (post.id * 7) % 100 + 1,
          category: ['Electronics', 'Office', 'Accessories'][
            (post.id - 1) % 3
          ]
        }))
      ),

      // 3. Save the initial API data in localStorage.
      tap(products => this.saveProducts(products))
    );
  }

  saveProducts(products: Product[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(products)
    );
  }

  private readSavedProducts(): Product[] | null {
    try {
      const storedProducts = localStorage.getItem(this.storageKey);

      if (storedProducts === null) {
        return null;
      }

      const parsedProducts: unknown = JSON.parse(storedProducts);

      return Array.isArray(parsedProducts)
        ? parsedProducts as Product[]
        : null;
    } catch {
      return null;
    }
  }
}
