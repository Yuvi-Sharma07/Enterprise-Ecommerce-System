import { Component, inject, signal, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService, CurrencyCode } from '../../services/currency.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  public router = inject(Router);

  // Inputs & Outputs matching React props
  darkMode = input<boolean>(true);
  darkModeChange = output<boolean>();

  // Component local UI states
  showCountryDropdown = signal<boolean>(false);
  showHelpModal = signal<boolean>(false);
  showSellModal = signal<boolean>(false);
  showCategoriesModal = signal<boolean>(false);
  showManufacturersModal = signal<boolean>(false);
  showOrderProtectionModal = signal<boolean>(false);
  showAboutModal = signal<boolean>(false);

  countries = [
    { code: 'US', label: 'United States', flag: '🇺🇸', currency: 'USD' as CurrencyCode },
    { code: 'IN', label: 'India', flag: '🇮🇳', currency: 'INR' as CurrencyCode },
    { code: 'DE', label: 'Germany', flag: '🇪🇺', currency: 'EUR' as CurrencyCode },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' as CurrencyCode }
  ];

  get activeItemsCount(): number {
    return this.cartService.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  }

  toggleDarkMode() {
    this.darkModeChange.emit(!this.darkMode());
  }

  handleLogoClick(event: MouseEvent) {
    event.preventDefault();
    if (this.router.url === '/') {
      window.location.reload();
    } else {
      this.router.navigate(['/']);
    }
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  alert(msg: string) {
    window.alert(msg);
  }
}
