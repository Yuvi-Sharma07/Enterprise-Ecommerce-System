import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { API_BASE_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/products/categories`);
  }

  getProducts(params: {
    page: number;
    size: number;
    sortBy: string;
    direction: string;
    query?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  }): Observable<any> {
    let url = `${API_BASE_URL}/api/products?page=${params.page}&size=${params.size}&sortBy=${params.sortBy}&direction=${params.direction}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;
    if (params.categoryId) url += `&categoryId=${params.categoryId}`;
    if (params.minPrice) url += `&minPrice=${params.minPrice}`;
    if (params.maxPrice) url += `&maxPrice=${params.maxPrice}`;
    return this.http.get<any>(url);
  }

  getFrequentlyViewed(limit: number = 4): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/products/frequently-viewed?limit=${limit}`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/api/products/${id}`);
  }

  getBarcode(sku: string): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/api/util/barcode?text=${sku}`);
  }

  getQrcode(sku: string): Observable<any> {
    return this.http.get<any>(`${API_BASE_URL}/api/util/qrcode?text=${sku}`);
  }

  getReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/reviews/product/${productId}`);
  }

  getAverageRating(productId: number): Observable<number> {
    return this.http.get<number>(`${API_BASE_URL}/api/reviews/product/${productId}/average`);
  }

  submitReview(productId: number, customerId: number, rating: number, reviewText: string): Observable<any> {
    return this.http.post<any>(
      `${API_BASE_URL}/api/reviews?productId=${productId}&customerId=${customerId}&rating=${rating}&reviewText=${encodeURIComponent(reviewText)}`,
      {}
    );
  }

  // Wishlist
  getWishlist(customerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/wishlist/${customerId}`);
  }

  addToWishlist(customerId: number, productId: number): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/api/wishlist/${customerId}/add?productId=${productId}`, {});
  }

  removeFromWishlist(customerId: number, productId: number): Observable<any> {
    return this.http.delete<any>(`${API_BASE_URL}/api/wishlist/${customerId}/remove?productId=${productId}`);
  }
}
