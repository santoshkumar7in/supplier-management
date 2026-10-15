
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { SupplierComponent } from './components/supplier/supplier';
import { ProductComponent } from './components/product/product';
import { PurchaseOrderComponent } from './components/purchase-order/purchase-order';
import { Login } from './components/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },  
  { path: 'home', component: Home },
  { path: 'suppliers', component: SupplierComponent },
  { path: 'products', component: ProductComponent },
  { path: 'purchase-orders', component: PurchaseOrderComponent },
  { path: 'login', component: Login }
];
