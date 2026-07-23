import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html'
})
export class OrdersComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);
  public currencyService = inject(CurrencyService);

  orders = signal<any[]>([]);

  ngOnInit() {
    this.fetchOrders();
  }

  async fetchOrders() {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${API_BASE_URL}/api/orders/customer/${user.customerId}`)
      );
      this.orders.set(res.content || []);
    } catch (err) {
      console.error(err);
    }
  }

  async requestCancel(orderId: number) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {})
      );
      alert('Order cancelled!');
      this.fetchOrders();
    } catch (err) {
      console.error(err);
    }
  }

  async requestReturn(orderId: number) {
    if (!window.confirm('Are you sure you want to return this order?')) return;
    try {
      await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/orders/${orderId}/return`, {})
      );
      alert('Order return processed! Funds will be refunded to your Stripe account.');
      this.fetchOrders();
    } catch (err) {
      console.error(err);
    }
  }

  getStepIndex(status: string): number {
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
    return steps.indexOf(status);
  }
}
