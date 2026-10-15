
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { SupplierService } from '../../services/supplier.service';
import { ProductService } from '../../services/product.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private supplierService = inject(SupplierService);
  private productService = inject(ProductService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private cdr = inject(ChangeDetectorRef);

  totalSuppliers = 0;
  totalProducts = 0;
  totalPurchaseOrders = 0;
  totalOrderValue = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.supplierService.getSuppliers().subscribe({
      next: suppliers => {
        this.totalSuppliers = suppliers.length;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load supplier count:', error);
      }
    });

    this.productService.getProducts().subscribe({
      next: products => {
        this.totalProducts = products.length;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load product count:', error);
      }
    });

    this.purchaseOrderService.getOrders().subscribe({
      next: orders => {
        this.totalPurchaseOrders = orders.length;
        this.totalOrderValue = orders.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        );
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load purchase order count:', error);
      }
    });
  }
}
