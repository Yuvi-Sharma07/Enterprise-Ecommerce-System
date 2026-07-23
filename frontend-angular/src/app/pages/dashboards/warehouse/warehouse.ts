import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './warehouse.html'
})
export class WarehouseDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  public authService = inject(AuthService);

  warehouses = signal<any[]>([]);
  selectedWarehouseId = signal<number | null>(null);
  warehouseStock = signal<any[]>([]);
  incomingPOs = signal<any[]>([]);
  products = signal<any[]>([]);

  // Stock Transfer Form State
  sourceWarehouseId = '';
  targetWarehouseId = '';
  transferProductId = '';
  transferQty = '';

  // Create Warehouse Form State
  showCreateForm = signal<boolean>(false);
  newName = '';
  newLocation = '';
  newCapacity = '';

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      const whRes = await firstValueFrom(
        this.http.get<any[]>(`${API_BASE_URL}/api/warehouses`)
      );
      this.warehouses.set(whRes);

      if (whRes.length > 0 && !this.selectedWarehouseId()) {
        this.selectedWarehouseId.set(whRes[0].id);
        this.loadWarehouseStock(whRes[0].id);
      } else if (this.selectedWarehouseId()) {
        this.loadWarehouseStock(this.selectedWarehouseId()!);
      }

      const poRes = await firstValueFrom(
        this.http.get<any[]>(`${API_BASE_URL}/api/suppliers/pos`)
      );
      this.incomingPOs.set(
        poRes.filter((po: any) => po.status === 'SHIPPED' || po.status === 'APPROVED' || po.status === 'PENDING')
      );

      const prodRes = await firstValueFrom(
        this.http.get<any>(`${API_BASE_URL}/api/products?size=100`)
      );
      this.products.set(prodRes.content || []);
    } catch (err) {
      console.error(err);
    }
  }

  async loadWarehouseStock(warehouseId: number) {
    try {
      const res = await firstValueFrom(
        this.http.get<any[]>(`${API_BASE_URL}/api/warehouses/${warehouseId}/stock`)
      );
      this.warehouseStock.set(res);
    } catch (err) {
      console.error(err);
    }
  }

  selectWarehouse(id: number) {
    this.selectedWarehouseId.set(id);
    this.loadWarehouseStock(id);
  }

  async handleCreateWarehouse() {
    try {
      await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/warehouses`, {
          name: this.newName,
          location: this.newLocation,
          maxCapacity: Number(this.newCapacity)
        })
      );
      alert('Warehouse created successfully!');
      this.newName = '';
      this.newLocation = '';
      this.newCapacity = '';
      this.showCreateForm.set(false);
      this.loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error occurred.');
    }
  }

  async handleTransferStock() {
    try {
      await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/warehouses/transfer`, {
          sourceWarehouseId: Number(this.sourceWarehouseId),
          targetWarehouseId: Number(this.targetWarehouseId),
          productId: Number(this.transferProductId),
          quantity: Number(this.transferQty)
        })
      );
      alert('Stock transfer completed successfully!');
      this.transferQty = '';
      this.loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Transfer failed.');
    }
  }

  async handleReceiveShipment(poId: number) {
    try {
      await firstValueFrom(
        this.http.put<any>(`${API_BASE_URL}/api/suppliers/pos/${poId}/status?status=DELIVERED`, {})
      );
      alert('Shipment received! Warehouse inventory has been auto-replenished.');
      this.loadData();
    } catch (err) {
      console.error(err);
    }
  }
}
