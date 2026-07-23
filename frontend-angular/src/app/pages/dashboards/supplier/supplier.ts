import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './supplier.html'
})
export class SupplierDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);

  suppliers = signal<any[]>([]);
  purchaseOrders = signal<any[]>([]);
  trackingNumber = '';
  selectedPoId = signal<number | null>(null);

  // Supplier Form State
  selectedSupplierId = signal<number | null>(null);
  name = '';
  contactEmail = '';
  phone = '';
  address = '';
  showForm = signal<boolean>(false);

  // Filter POs belonging to selected supplier
  supplierPOs = computed(() => {
    const activeId = this.selectedSupplierId();
    if (!activeId) return [];
    return this.purchaseOrders().filter((po: any) => po.supplier.id === activeId);
  });

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const supRes = await firstValueFrom(
        this.http.get<any[]>(`${API_BASE_URL}/api/suppliers`)
      );
      this.suppliers.set(supRes);

      if (supRes.length > 0 && !this.selectedSupplierId()) {
        this.selectedSupplierId.set(supRes[0].id);
        this.startEditSupplier(supRes[0]);
      }

      const poRes = await firstValueFrom(
        this.http.get<any[]>(`${API_BASE_URL}/api/suppliers/pos`)
      );
      this.purchaseOrders.set(poRes);
    } catch (err) {
      console.error(err);
    }
  }

  async handleSupplierSubmit() {
    const payload = {
      name: this.name,
      contactEmail: this.contactEmail,
      phone: this.phone,
      address: this.address
    };

    try {
      const activeId = this.selectedSupplierId();
      if (activeId) {
        await firstValueFrom(
          this.http.put<any>(`${API_BASE_URL}/api/suppliers/${activeId}`, payload)
        );
        alert('Supplier credentials updated!');
      } else {
        await firstValueFrom(
          this.http.post<any>(`${API_BASE_URL}/api/suppliers`, payload)
        );
        alert('Supplier profile registered!');
      }
      this.showForm.set(false);
      this.loadData();
    } catch (err) {
      console.error(err);
    }
  }

  startEditSupplier(s: any) {
    this.selectedSupplierId.set(s.id);
    this.name = s.name;
    this.contactEmail = s.contactEmail;
    this.phone = s.phone;
    this.address = s.address;
  }

  async handleShipPO(poId: number) {
    if (!this.trackingNumber.trim()) {
      alert('Please enter a delivery tracking number');
      return;
    }
    try {
      await firstValueFrom(
        this.http.put<any>(
          `${API_BASE_URL}/api/suppliers/pos/${poId}/ship?trackingNumber=${encodeURIComponent(this.trackingNumber)}`,
          {}
        )
      );
      alert('Purchase Order shipped! Tracking log added.');
      this.trackingNumber = '';
      this.selectedPoId.set(null);
      this.loadData();
    } catch (err) {
      console.error(err);
    }
  }

  openShipModal(poId: number) {
    this.selectedPoId.set(poId);
    this.trackingNumber = '';
  }
}
