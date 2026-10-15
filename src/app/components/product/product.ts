
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import {
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  searchText = '';

  displayedColumns = [
    'id',
    'name',
    'category',
    'price',
    'quantity',
    'description',
    'actions'
  ];

  pageIndex = 0;
  pageSize = 5;
  loading = false;
  errorMessage = '';

  showForm = false;
  isEditing = false;

  formProduct: Product = this.emptyProduct();

  ngOnInit(): void {
    this.loadProducts();
  }

  // Load products from localStorage or the API
  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.pageIndex = 0;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load products:', error);

        this.errorMessage =
          'Unable to load products. Check your connection and try again.';

        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Filter products automatically as the user types
  get filteredProducts(): Product[] {
    const term = this.searchText.trim().toLowerCase();

    return this.products.filter(product =>
      [
        product.name,
        product.description,
        product.category,
        String(product.price),
        String(product.quantity)
      ].some(value => value.toLowerCase().includes(term))
    );
  }

  // Return only products for the current page
  get pagedProducts(): Product[] {
    const start = this.pageIndex * this.pageSize;

    return this.filteredProducts.slice(
      start,
      start + this.pageSize
    );
  }

  onSearchChange(): void {
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // Open a blank form for adding a product
  addProduct(): void {
    this.isEditing = false;
    this.formProduct = this.emptyProduct();
    this.showForm = true;
  }

  // Open the form with the selected product details
  editProduct(product: Product): void {
    this.isEditing = true;
    this.formProduct = { ...product };
    this.showForm = true;
  }

  // Add a new product or update an existing product
  saveProduct(): void {
    const p = this.formProduct;

    // Validate product details
    if (
      !p.name.trim() ||
      !p.description.trim() ||
      !p.category.trim() ||
      !Number.isFinite(p.price) ||
      p.price < 0 ||
      !Number.isInteger(p.quantity) ||
      p.quantity < 0
    ) {
      return;
    }

    if (this.isEditing) {
      // Update the existing product
      this.products = this.products.map(product =>
        product.id === p.id ? { ...p } : product
      );
    } else {
      // Create a new product with a unique ID
      const newProduct: Product = {
        ...p,
        id: Math.max(
          0,
          ...this.products.map(item => item.id)
        ) + 1
      };

      this.products = [newProduct, ...this.products];
    }

    // Persist changes in browser localStorage
    this.productService.saveProducts(this.products);

    this.showForm = false;
    this.pageIndex = 0;
    this.cdr.markForCheck();
  }

  // Delete a product after confirmation
  deleteProduct(product: Product): void {
    if (!window.confirm(`Delete product "${product.name}"?`)) {
      return;
    }

    this.products = this.products.filter(
      item => item.id !== product.id
    );

    // Persist the deletion in browser localStorage
    this.productService.saveProducts(this.products);

    // Keep the current page index within valid bounds
    const lastPage = Math.max(
      0,
      Math.ceil(
        this.filteredProducts.length / this.pageSize
      ) - 1
    );

    this.pageIndex = Math.min(this.pageIndex, lastPage);
    this.cdr.markForCheck();
  }

  cancelForm(): void {
    this.showForm = false;
  }

  private emptyProduct(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: 'Electronics'
    };
  }
}
