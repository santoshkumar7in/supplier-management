import { TestBed } from '@angular/core/testing';
import { PurchaseOrder } from './purchase-order.service';

describe('PurchaseOrder', () => {
  let service: PurchaseOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
