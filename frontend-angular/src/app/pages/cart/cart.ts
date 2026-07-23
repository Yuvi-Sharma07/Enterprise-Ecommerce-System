import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html'
})
export class CartComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private router = inject(Router);

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
  }

  toggleSaveForLater(productId: number) {
    this.cartService.toggleSaveForLater(productId);
  }

  navigateToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
