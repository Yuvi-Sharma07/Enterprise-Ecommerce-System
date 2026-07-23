import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-details.html'
})
export class ProductDetailsComponent implements OnInit {
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  productId = signal<number>(0);
  product = signal<any>(null);
  barcodeImg = signal<string>('');
  qrcodeImg = signal<string>('');

  // Reviews state
  reviews = signal<any[]>([]);
  rating = signal<number>(5);
  reviewText = signal<string>('');
  avgRating = signal<number>(0.0);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = Number(params['id']);
      if (id) {
        this.productId.set(id);
        this.fetchProductDetails(id);
      }
    });
  }

  fetchProductDetails(id: number) {
    this.productService.getProduct(id).subscribe({
      next: (prod: any) => {
        this.product.set(prod);
        
        // Fetch barcode and QR code
        this.productService.getBarcode(prod.sku).subscribe({
          next: (res: any) => this.barcodeImg.set(res.image),
          error: (err: any) => console.error(err)
        });

        this.productService.getQrcode(prod.sku).subscribe({
          next: (res: any) => this.qrcodeImg.set(res.image),
          error: (err: any) => console.error(err)
        });

        // Fetch reviews
        this.fetchReviews(id);
      },
      error: (err: any) => console.error(err)
    });
  }

  fetchReviews(id: number) {
    this.productService.getReviews(id).subscribe({
      next: (revs: any[]) => this.reviews.set(revs),
      error: (err: any) => console.error(err)
    });

    this.productService.getAverageRating(id).subscribe({
      next: (avg: number) => this.avgRating.set(avg),
      error: (err: any) => console.error(err)
    });
  }

  onSubmitReview() {
    const user = this.authService.currentUser();
    if (!user || !user.customerId) {
      alert('Please log in as customer to submit reviews');
      return;
    }

    const text = this.reviewText().trim();
    if (!text) return;

    this.productService.submitReview(this.productId(), user.customerId, this.rating(), text).subscribe({
      next: () => {
        alert('Review submitted! It will appear after admin moderation.');
        this.reviewText.set('');
      },
      error: (err: any) => {
        console.error(err);
        alert('Failed to submit review.');
      }
    });
  }

  addItem(productId: number, quantity: number) {
    this.cartService.addItem(productId, quantity);
  }
}
