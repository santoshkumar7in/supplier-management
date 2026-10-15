
export type OrderStatus =
  | 'Pending'
  | 'Approved'
  | 'Received'
  | 'Cancelled';

export interface PurchaseOrder {
  id: number;
  supplierId: number;
  supplierName: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  orderDate: string;
  status: OrderStatus;
}
