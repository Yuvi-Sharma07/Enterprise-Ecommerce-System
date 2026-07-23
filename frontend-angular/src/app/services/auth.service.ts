import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  roles: string[];
  customerId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Core Auth Signals
  public currentUser = signal<User | null>(null);
  public loading = signal<boolean>(true);
  public isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.checkSession();
  }

  private checkSession() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        this.logout();
      }
    }
    this.loading.set(false);
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${API_BASE_URL}/api/auth/login`, { email, password })
      );
      
      const { accessToken, refreshToken, id, roles, customerId } = res;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const userData: User = { id, email, roles, customerId };
      localStorage.setItem('user', JSON.stringify(userData));
      
      this.currentUser.set(userData);
      return userData;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  }

  async register(email: string, password: string, roles: string[]): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${API_BASE_URL}/api/auth/register`, { email, password, roles })
    );
  }

  async verifyEmail(token: string): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${API_BASE_URL}/api/auth/verify?token=${token}`)
    );
  }

  async forgotPassword(email: string): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${API_BASE_URL}/api/auth/forgot-password?email=${email}`, {})
    );
  }

  async resetPassword(token: string, password: string): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${API_BASE_URL}/api/auth/reset-password`, { token, password })
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles.includes(role) || false;
  }
}
