
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PurchaseOrder } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private readonly storageKey = 'supplier-management-purchase-orders';

  private ordersSubject = new BehaviorSubject<PurchaseOrder[]>(
    this.loadOrders()
  );

  private nextId =
    Math.max(0, ...this.ordersSubject.value.map(order => order.id)) + 1;

  getOrders(): Observable<PurchaseOrder[]> {
    return this.ordersSubject.asObservable();
  }

  addOrder(order: Omit<PurchaseOrder, 'id'>): void {
    const newOrder: PurchaseOrder = {
      ...order,
      id: this.nextId++
    };

    this.saveOrders([
      newOrder,
      ...this.ordersSubject.value
    ]);
  }

  updateOrder(order: PurchaseOrder): void {
    const updatedOrders = this.ordersSubject.value.map(existing =>
      existing.id === order.id ? { ...order } : existing
    );

    this.saveOrders(updatedOrders);
  }

  deleteOrder(id: number): void {
    this.saveOrders(
      this.ordersSubject.value.filter(order => order.id !== id)
    );
  }

  private saveOrders(orders: PurchaseOrder[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
    this.ordersSubject.next(orders);
  }

  private loadOrders(): PurchaseOrder[] {
    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed as PurchaseOrder[] : [];
    } catch {
      return [];
    }
  }
}
