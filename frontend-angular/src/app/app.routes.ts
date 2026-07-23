import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog';
import { ProductDetailsComponent } from './pages/product-details/product-details';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { VerifyComponent } from './pages/auth/verify/verify';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password';
import { CartComponent } from './pages/cart/cart';
import { CheckoutComponent } from './pages/checkout/checkout';
import { OrdersComponent } from './pages/orders/orders';
import { AdminDashboardComponent } from './pages/dashboards/admin/admin';
import { WarehouseDashboardComponent } from './pages/dashboards/warehouse/warehouse';
import { SupplierDashboardComponent } from './pages/dashboards/supplier/supplier';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', component: CatalogComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { 
    path: 'cart', 
    component: CartComponent, 
    canActivate: [authGuard(['ROLE_CUSTOMER'])] 
  },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    canActivate: [authGuard(['ROLE_CUSTOMER'])] 
  },
  { 
    path: 'orders', 
    component: OrdersComponent, 
    canActivate: [authGuard(['ROLE_CUSTOMER'])] 
  },
  { 
    path: 'wishlist', 
    component: CatalogComponent, 
    canActivate: [authGuard(['ROLE_CUSTOMER'])] 
  },

  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard(['ROLE_ADMIN'])] 
  },
  { 
    path: 'warehouse', 
    component: WarehouseDashboardComponent, 
    canActivate: [authGuard(['ROLE_WAREHOUSE_MANAGER', 'ROLE_ADMIN'])] 
  },
  { 
    path: 'supplier', 
    component: SupplierDashboardComponent, 
    canActivate: [authGuard(['ROLE_SUPPLIER', 'ROLE_ADMIN'])] 
  },

  { path: '**', redirectTo: '' }
];
