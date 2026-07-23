import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { ProductService } from '../../services/product.service';


@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalog.html'
})
export class CatalogComponent implements OnInit {
  public authService = inject(AuthService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private productService = inject(ProductService);
  private router = inject(Router);

  // Catalog state
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  frequentlyViewed = signal<any[]>([]);
  wishlistIds = signal<number[]>([]);

  // Search & Filters state
  query = signal<string>('');
  selectedCat = signal<string>('');
  minPrice = signal<string>('');
  maxPrice = signal<string>('');
  sortBy = signal<string>('id');
  page = signal<number>(0);
  totalPages = signal<number>(1);

  // Active tabs
  searchTab = signal<'products' | 'manufacturers' | 'worldwide' | 'ai'>('products');

  // Modal & AI Search states
  showImageSearchModal = signal<boolean>(false);
  analyzingImage = signal<boolean>(false);
  aiQuery = signal<string>('');
  aiSearching = signal<boolean>(false);

  // AI Chat Bot states
  showAIChat = signal<boolean>(false);
  chatMessages = signal<any[]>([
    { sender: 'bot', text: 'Hello! I am your RB Cart AI Assistant. Ask me anything about tracking your packages, warehouse stock details, or product discounts!' }
  ]);
  chatInput = signal<string>('');
  isTyping = signal<boolean>(false);

  // Mocks matching React
  mockManufacturers = [
    { name: 'TechCorp Industry Inc.', location: 'New York, US', rating: 4.9, activeWarehouses: ['NYC Warehouse Hub'], category: 'Electronics & Gadgets' },
    { name: 'FitWear Apparel Ltd.', location: 'Los Angeles, US', rating: 4.8, activeWarehouses: ['LA Distribution Center'], category: 'Apparel & Fashion' },
    { name: 'HomeStyle Designs LLC', location: 'London, UK', rating: 4.7, activeWarehouses: ['NYC Warehouse Hub', 'LA Distribution Center'], category: 'Sports & Kitchen' },
    { name: 'GymGear Logistics Corp', location: 'Frankfurt, DE', rating: 4.9, activeWarehouses: ['LA Distribution Center'], category: 'Sports & Outdoors' }
  ];

  mockWarehouses = [
    { name: 'East Coast NYC Warehouse Hub', code: 'WH-NYC-01', location: 'Queens, New York', capacity: '85% Active', shippingRoutes: ['North America', 'Europe'], coordinates: '40.7128° N, 74.0060° W' },
    { name: 'West Coast LA Distribution Center', code: 'WH-LAX-02', location: 'Los Angeles, California', capacity: '60% Active', shippingRoutes: ['North America', 'Asia-Pacific'], coordinates: '34.0522° N, 118.2437° W' },
    { name: 'Eurozone Frankfurt Fulfillment Hub', code: 'WH-FRA-03', location: 'Frankfurt, Germany', capacity: '40% Active', shippingRoutes: ['Europe', 'Africa'], coordinates: '50.1109° N, 8.6821° E' }
  ];

  get filteredManufacturers() {
    const q = this.query().toLowerCase();
    return this.mockManufacturers.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.category.toLowerCase().includes(q)
    );
  }

  get filteredWarehouses() {
    const q = this.query().toLowerCase();
    return this.mockWarehouses.filter(w => 
      w.name.toLowerCase().includes(q) || 
      w.code.toLowerCase().includes(q) || 
      w.location.toLowerCase().includes(q)
    );
  }

  constructor() {
    // Reload products when filters change
    effect(() => {
      this.fetchProducts();
    });
    
    // Reload wishlist when user state changes
    effect(() => {
      this.fetchWishlist();
    });
  }

  ngOnInit() {
    this.fetchFilters();
    this.fetchFrequentlyViewed();
  }

  fetchFilters() {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error(err)
    });
  }

  fetchProducts() {
    this.productService.getProducts({
      page: this.page(),
      size: 8,
      sortBy: this.sortBy(),
      direction: 'DESC',
      query: this.query(),
      categoryId: this.selectedCat(),
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice()
    }).subscribe({
      next: (data) => {
        this.products.set(data.content || []);
        this.totalPages.set(data.totalPages || 1);
      },
      error: (err) => console.error(err)
    });
  }

  fetchFrequentlyViewed() {
    this.productService.getFrequentlyViewed(4).subscribe({
      next: (data) => this.frequentlyViewed.set(data || []),
      error: (err) => console.error(err)
    });
  }

  fetchWishlist() {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) {
      this.wishlistIds.set([]);
      return;
    }
    this.productService.getWishlist(user.customerId).subscribe({
      next: (data) => {
        this.wishlistIds.set(data.map((w: any) => w.product.id));
      },
      error: (err) => console.error(err)
    });
  }

  toggleWishlist(productId: number) {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) {
      alert('Please log in as customer to use wishlist');
      return;
    }

    const currentIds = this.wishlistIds();
    if (currentIds.includes(productId)) {
      this.productService.removeFromWishlist(user.customerId, productId).subscribe({
        next: () => this.wishlistIds.set(currentIds.filter(id => id !== productId)),
        error: (err) => console.error(err)
      });
    } else {
      this.productService.addToWishlist(user.customerId, productId).subscribe({
        next: () => this.wishlistIds.set([...currentIds, productId]),
        error: (err) => console.error(err)
      });
    }
  }

  handleAISearch(promptText: string) {
    if (!promptText.trim()) return;
    this.aiQuery.set(promptText);
    this.aiSearching.set(true);
    
    setTimeout(() => {
      const text = promptText.toLowerCase();
      let matchedKeyword = '';
      if (text.includes('keyboard') || text.includes('keyboards')) {
        matchedKeyword = 'Keyboard';
      } else if (text.includes('earbud') || text.includes('earbuds') || text.includes('buds') || text.includes('headphones')) {
        matchedKeyword = 'Buds';
      } else if (text.includes('shoe') || text.includes('shoes') || text.includes('sneaker') || text.includes('sneakers')) {
        matchedKeyword = 'Sneakers';
      } else if (text.includes('blender') || text.includes('juicer')) {
        matchedKeyword = 'Blender';
      } else if (text.includes('kettle')) {
        matchedKeyword = 'Kettle';
      } else if (text.includes('hoodie') || text.includes('hoodies')) {
        matchedKeyword = 'Hoodie';
      } else if (text.includes('jacket') || text.includes('jackets')) {
        matchedKeyword = 'Jacket';
      } else if (text.includes('mat') || text.includes('yoga')) {
        matchedKeyword = 'Mat';
      } else {
        matchedKeyword = promptText.split(' ').slice(0, 2).join(' ');
      }
      this.query.set(matchedKeyword);
      this.aiSearching.set(false);
    }, 1200);
  }

  handleSendChat() {
    const input = this.chatInput().trim();
    if (!input) return;

    this.chatMessages.update(prev => [...prev, { sender: 'user', text: input }]);
    this.chatInput.set('');
    this.isTyping.set(true);

    setTimeout(() => {
      this.isTyping.set(false);
      const text = input.toLowerCase();
      let botResponse = "That sounds interesting! You can search our 1,020 high-quality products or ask me to check active warehouse inventories.";

      if (text.includes('track') || text.includes('order')) {
        botResponse = "You can view all order progress on your Profile page. We track order states dynamically from CONFIRMED -> PROCESSED -> SHIPPED -> DELIVERED!";
      } else if (text.includes('coupon') || text.includes('discount') || text.includes('promo')) {
        botResponse = "Try applying coupon codes 'WELCOME10' or 'BIGDISCOUNT' during checkout for up to 20% off!";
      } else if (text.includes('warehouse') || text.includes('stock') || text.includes('inventory')) {
        botResponse = "We have fully stocked distribution centers in New York (East Coast) and Los Angeles (West Coast) for overnight shipping!";
      } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
        botResponse = "Hello there! How can I assist you with your shopping experience today?";
      }

      this.chatMessages.update(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  }

  selectTab(tab: 'products' | 'manufacturers' | 'worldwide' | 'ai') {
    this.searchTab.set(tab);
    if (tab !== 'products' && tab !== 'ai') {
      this.query.set('');
    }
  }

  toggleCategory(catId: number) {
    const current = this.selectedCat();
    this.selectedCat.set(current === catId.toString() ? '' : catId.toString());
  }

  addItem(productId: number, quantity: number) {
    this.cartService.addItem(productId, quantity);
  }
}
