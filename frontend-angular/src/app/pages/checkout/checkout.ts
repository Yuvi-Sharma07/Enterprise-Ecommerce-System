import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html'
})
export class CheckoutComponent {
  private http = inject(HttpClient);
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private router = inject(Router);

  // Form inputs
  couponCode = '';
  appliedDiscount = signal<any>(null);
  couponError = signal<string>('');

  stripeToken = 'pm_card_visa';
  loading = signal<boolean>(false);
  checkoutStep = signal<'details' | 'success'>('details');
  createdOrder = signal<any>(null);

  async applyCoupon() {
    this.couponError.set('');
    if (!this.couponCode.trim()) return;

    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${API_BASE_URL}/api/coupons/validate?code=${this.couponCode}`)
      );
      this.appliedDiscount.set(res);
    } catch (err: any) {
      console.error(err);
      this.couponError.set(err.error?.message || 'Invalid coupon');
    }
  }

  getDiscountedTotal(): number {
    const totalAmount = this.cartService.totalAmount();
    const discount = this.appliedDiscount();
    if (!discount) return totalAmount;

    if (discount.discountType === 'PERCENTAGE') {
      const disc = totalAmount * (discount.discountValue / 100);
      return Math.max(0, totalAmount - disc);
    }
    return Math.max(0, totalAmount - discount.discountValue);
  }

  async handleCheckout() {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    this.loading.set(true);
    try {
      // 1. Create order
      const checkoutRes = await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/orders/checkout`, {
          customerId: user.customerId,
          couponCode: this.appliedDiscount() ? this.appliedDiscount().code : undefined
        })
      );

      const orderId = checkoutRes.id;

      // 2. Pay order
      const payRes = await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/orders/${orderId}/pay?stripeToken=${this.stripeToken}`, {})
      );

      this.createdOrder.set(payRes);
      this.cartService.clearCart();
      this.checkoutStep.set('success');
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Checkout failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
