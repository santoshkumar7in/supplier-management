
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

import { Supplier } from '../../models/supplier.model';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './supplier.html',
  styleUrl: './supplier.scss'
})
export class SupplierComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];
  searchText = '';

  displayedColumns = [
    'id',
    'name',
    'company',
    'email',
    'phone',
    'city',
    'actions'
  ];

  pageIndex = 0;
  pageSize = 5;
  loading = false;
  errorMessage = '';

  showForm = false;
  isEditing = false;

  formSupplier: Supplier = this.emptySupplier();

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loading = false;
        this.pageIndex = 0;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load suppliers:', error);

        this.errorMessage =
          'Unable to load suppliers. Check your internet connection and try again.';

        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredSuppliers(): Supplier[] {
    const term = this.searchText.trim().toLowerCase();

    return this.suppliers.filter(supplier =>
      [
        supplier.name,
        supplier.company,
        supplier.email,
        supplier.phone,
        supplier.city
      ].some(value =>
        value.toLowerCase().includes(term)
      )
    );
  }

  get pagedSuppliers(): Supplier[] {
    const start = this.pageIndex * this.pageSize;

    return this.filteredSuppliers.slice(
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

  addSupplier(): void {
    this.isEditing = false;
    this.formSupplier = this.emptySupplier();
    this.showForm = true;
  }

  editSupplier(supplier: Supplier): void {
    this.isEditing = true;
    this.formSupplier = { ...supplier };
    this.showForm = true;
  }

  saveSupplier(): void {
    const { name, company, email, phone, city } =
      this.formSupplier;

    if (
      ![name, company, email, phone, city]
        .every(value => value.trim())
    ) {
      return;
    }

    if (this.isEditing) {
      this.suppliers = this.suppliers.map(supplier =>
        supplier.id === this.formSupplier.id
          ? { ...this.formSupplier }
          : supplier
      );
    } else {
      const newSupplier: Supplier = {
        ...this.formSupplier,
        id: Math.max(
          0,
          ...this.suppliers.map(supplier => supplier.id)
        ) + 1
      };

      this.suppliers = [
        newSupplier,
        ...this.suppliers
      ];
    }

    // Save changes to browser storage.
    this.supplierService.saveSuppliers(this.suppliers);

    this.showForm = false;
    this.pageIndex = 0;
  }

  deleteSupplier(supplier: Supplier): void {
    const confirmed = window.confirm(
      `Delete supplier "${supplier.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.suppliers = this.suppliers.filter(
      item => item.id !== supplier.id
    );

    // Persist the deletion.
    this.supplierService.saveSuppliers(this.suppliers);

    const lastPage = Math.max(
      0,
      Math.ceil(
        this.filteredSuppliers.length / this.pageSize
      ) - 1
    );

    this.pageIndex = Math.min(
      this.pageIndex,
      lastPage
    );
  }

  cancelForm(): void {
    this.showForm = false;
  }

  private emptySupplier(): Supplier {
    return {
      id: 0,
      name: '',
      company: '',
      email: '',
      phone: '',
      city: ''
    };
  }
}
