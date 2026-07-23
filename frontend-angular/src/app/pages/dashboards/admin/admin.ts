import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { CurrencyService } from '../../../services/currency.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin.html'
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);
  public currencyService = inject(CurrencyService);

  kpis = signal<any>(null);
  forecast = signal<any[]>([]);
  pendingReviews = signal<any[]>([]);
  auditLogs = signal<any[]>([]);

  // Product CRUD state
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  brands = signal<any[]>([]);

  showProductForm = signal<boolean>(false);
  editingProduct = signal<any>(null);

  // Form Fields
  name = '';
  description = '';
  price = '';
  sku = '';
  imageUrl = '';
  selectedCat = '';
  selectedBrand = '';
  active = true;

  activeTab = signal<'analytics' | 'products' | 'reviews' | 'logs'>('analytics');
  loading = signal<boolean>(false);

  // Computed properties for custom SVG rendering
  svgPoints = computed(() => {
    const data = this.forecast();
    if (data.length === 0) return '';
    const width = 600;
    const height = 200;
    const maxVal = Math.max(...data.map(d => d.revenue || d.value || 100)) * 1.15;
    
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const val = d.revenue || d.value || 0;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');
  });

  svgGridlines = computed(() => {
    const lines = [];
    const height = 200;
    const width = 600;
    for (let i = 1; i <= 4; i++) {
      lines.push((i / 4) * height);
    }
    return lines;
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [kpiRes, forecastRes, reviewRes, logRes, prodRes, catRes, brandRes] = await Promise.all([
        firstValueFrom(this.http.get<any>(`${API_BASE_URL}/api/dashboard/kpis`)),
        firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/api/dashboard/forecast`)),
        firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/api/reviews/pending`)),
        firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/api/audit-logs`)),
        firstValueFrom(this.http.get<any>(`${API_BASE_URL}/api/products?size=50`)),
        firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/api/products/categories`)),
        firstValueFrom(this.http.get<any[]>(`${API_BASE_URL}/api/products/brands`))
      ]);

      this.kpis.set(kpiRes);
      this.forecast.set(forecastRes);
      this.pendingReviews.set(reviewRes);
      this.auditLogs.set(logRes);
      this.products.set(prodRes.content || []);
      this.categories.set(catRes);
      this.brands.set(brandRes);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async handleApproveReview(id: number) {
    try {
      await firstValueFrom(
        this.http.put<any>(`${API_BASE_URL}/api/reviews/${id}/approve`, {})
      );
      this.pendingReviews.update(prev => prev.filter(r => r.id !== id));
      alert('Review approved!');
    } catch (err) {
      console.error(err);
    }
  }

  async handleProductSubmit() {
    const payload = {
      name: this.name,
      description: this.description,
      price: Number(this.price),
      sku: this.sku,
      imageUrl: this.imageUrl,
      categoryId: Number(this.selectedCat),
      brandId: Number(this.selectedBrand),
      active: this.active
    };

    try {
      const editing = this.editingProduct();
      if (editing) {
        await firstValueFrom(
          this.http.put<any>(`${API_BASE_URL}/api/products/${editing.id}`, payload)
        );
        alert('Product updated!');
      } else {
        await firstValueFrom(
          this.http.post<any>(`${API_BASE_URL}/api/products`, payload)
        );
        alert('Product created!');
      }
      this.resetForm();
      this.loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error occurred.');
    }
  }

  handleEditProduct(p: any) {
    this.editingProduct.set(p);
    this.name = p.name;
    this.description = p.description;
    this.price = p.price.toString();
    this.sku = p.sku;
    this.imageUrl = p.imageUrl || '';
    this.selectedCat = p.categoryId.toString();
    this.selectedBrand = p.brandId.toString();
    this.active = p.active;
    this.showProductForm.set(true);
  }

  async handleDeleteProduct(id: number) {
    if (!window.confirm('Mark this product as inactive?')) return;
    try {
      await firstValueFrom(
        this.http.delete<any>(`${API_BASE_URL}/api/products/${id}`)
      );
      alert('Product inactivated!');
      this.loadData();
    } catch (err) {
      console.error(err);
    }
  }

  resetForm() {
    this.editingProduct.set(null);
    this.name = '';
    this.description = '';
    this.price = '';
    this.sku = '';
    this.imageUrl = '';
    this.selectedCat = '';
    this.selectedBrand = '';
    this.active = true;
    this.showProductForm.set(false);
  }
}
