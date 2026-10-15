
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { Supplier } from '../../models/supplier.model';
import { Product } from '../../models/product.model';
import {
  OrderStatus,
  PurchaseOrder
} from '../../models/purchase-order.model';

import { SupplierService } from '../../services/supplier.service';
import { ProductService } from '../../services/product.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order',
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
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.scss'
})
export class PurchaseOrderComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private orderService = inject(PurchaseOrderService);
  private cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];
  products: Product[] = [];
  orders: PurchaseOrder[] = [];

  searchText = '';
  loading = true;
  errorMessage = '';

  displayedColumns = [
    'id',
    'supplierName',
    'productName',
    'quantity',
    'unitPrice',
    'total',
    'orderDate',
    'status',
    'actions'
  ];

  pageIndex = 0;
  pageSize = 5;
  showForm = false;
  isEditing = false;

  formOrder = this.emptyOrder();

  statuses: OrderStatus[] = [
    'Pending',
    'Approved',
    'Received',
    'Cancelled'
  ];

  ngOnInit(): void {
    this.supplierService.getSuppliers().subscribe({
      next: data => {
        this.suppliers = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load suppliers.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.productService.getProducts().subscribe({
      next: data => {
        this.products = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load products.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });

    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  get filteredOrders(): PurchaseOrder[] {
    const term = this.searchText.trim().toLowerCase();

    return this.orders.filter(order =>
      [
        String(order.id),
        order.supplierName,
        order.productName,
        order.status,
        order.orderDate
      ].some(value => value.toLowerCase().includes(term))
    );
  }

  get pagedOrders(): PurchaseOrder[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onProductChange(): void {
    const product = this.products.find(
      item => item.id === Number(this.formOrder.productId)
    );

    if (product) {
      this.formOrder.productName = product.name;
      this.formOrder.unitPrice = product.price;
    }

    this.formOrder.total =
      this.formOrder.quantity * this.formOrder.unitPrice;
  }

  onSupplierChange(): void {
    const supplier = this.suppliers.find(
      item => item.id === Number(this.formOrder.supplierId)
    );

    if (supplier) {
      this.formOrder.supplierName = supplier.name;
    }
  }

  onQuantityChange(): void {
    this.formOrder.total =
      this.formOrder.quantity * this.formOrder.unitPrice;
  }

  addOrder(): void {
    this.isEditing = false;
    this.formOrder = this.emptyOrder();
    this.showForm = true;
  }

  editOrder(order: PurchaseOrder): void {
    this.isEditing = true;
    this.formOrder = { ...order };
    this.showForm = true;
  }

  saveOrder(): void {
    const supplier = this.suppliers.find(
      item => item.id === Number(this.formOrder.supplierId)
    );

    const product = this.products.find(
      item => item.id === Number(this.formOrder.productId)
    );

    const quantity = Number(this.formOrder.quantity);

    if (!supplier || !product || !Number.isInteger(quantity) || quantity <= 0) {
      return;
    }

    const orderData = {
      ...this.formOrder,
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      total: quantity * product.price
    };

    if (this.isEditing) {
      this.orderService.updateOrder({
        ...orderData,
        id: this.formOrder.id
      });
    } else {
      this.orderService.addOrder(orderData);
    }

    this.showForm = false;
    this.pageIndex = 0;
  }

  deleteOrder(order: PurchaseOrder): void {
    if (!window.confirm(`Delete purchase order #${order.id}?`)) {
      return;
    }

    this.orderService.deleteOrder(order.id);

    const lastPage = Math.max(
      0,
      Math.ceil(this.filteredOrders.length / this.pageSize) - 1
    );

    this.pageIndex = Math.min(this.pageIndex, lastPage);
  }

  cancelForm(): void {
    this.showForm = false;
  }

  private emptyOrder(): PurchaseOrder {
    return {
      id: 0,
      supplierId: 0,
      supplierName: '',
      productId: 0,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      orderDate: new Date().toISOString().slice(0, 10),
      status: 'Pending'
    };
  }
}
