import { Injectable, signal, computed, inject, EffectRef, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  imageUrl: string;
  quantity: number;
  savedForLater: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Cart Signals
  public cartItems = signal<CartItem[]>([]);
  public savedItems = signal<CartItem[]>([]);
  public totalAmount = signal<number>(0);
  public loading = signal<boolean>(false);

  constructor() {
    // Synchronize cart with active user sessions using an effect
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.customerId) {
        this.fetchCart();
      } else {
        this.clearCart();
      }
    });
  }

  async fetchCart(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${API_BASE_URL}/api/cart/${user.customerId}`)
      );
      const items: CartItem[] = res.items || [];
      this.cartItems.set(items.filter(item => !item.savedForLater));
      this.savedItems.set(items.filter(item => item.savedForLater));
      this.totalAmount.set(res.totalAmount || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async addItem(productId: number, quantity: number): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/cart/${user.customerId}/add?productId=${productId}&quantity=${quantity}`, {})
      );
      const items: CartItem[] = res.items || [];
      this.cartItems.set(items.filter(item => !item.savedForLater));
      this.savedItems.set(items.filter(item => item.savedForLater));
      this.totalAmount.set(res.totalAmount || 0);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  }

  async updateQuantity(productId: number, quantity: number): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    try {
      const res = await firstValueFrom(
        this.http.put<any>(`${API_BASE_URL}/api/cart/${user.customerId}/update?productId=${productId}&quantity=${quantity}`, {})
      );
      const items: CartItem[] = res.items || [];
      this.cartItems.set(items.filter(item => !item.savedForLater));
      this.savedItems.set(items.filter(item => item.savedForLater));
      this.totalAmount.set(res.totalAmount || 0);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  }

  async removeItem(productId: number): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    try {
      const res = await firstValueFrom(
        this.http.delete<any>(`${API_BASE_URL}/api/cart/${user.customerId}/remove?productId=${productId}`)
      );
      const items: CartItem[] = res.items || [];
      this.cartItems.set(items.filter(item => !item.savedForLater));
      this.savedItems.set(items.filter(item => item.savedForLater));
      this.totalAmount.set(res.totalAmount || 0);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  }

  async toggleSaveForLater(productId: number): Promise<void> {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) return;

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/cart/${user.customerId}/toggle-save?productId=${productId}`, {})
      );
      const items: CartItem[] = res.items || [];
      this.cartItems.set(items.filter(item => !item.savedForLater));
      this.savedItems.set(items.filter(item => item.savedForLater));
      this.totalAmount.set(res.totalAmount || 0);
    } catch (err) {
      console.error('Error saving/restoring item:', err);
    }
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.savedItems.set([]);
    this.totalAmount.set(0);
  }
}
