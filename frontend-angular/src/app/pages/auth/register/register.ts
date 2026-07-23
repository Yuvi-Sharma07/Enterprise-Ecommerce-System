import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  role = 'CUSTOMER';
  firstName = '';
  lastName = '';
  phone = '';
  address = '';

  success = signal<string>('');
  error = signal<string>('');
  loading = signal<boolean>(false);

  async onSubmit() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    try {
      const payload: any = {
        email: this.email,
        password: this.password,
        role: this.role
      };

      if (this.role === 'CUSTOMER') {
        payload.firstName = this.firstName;
        payload.lastName = this.lastName;
        payload.phone = this.phone;
        payload.address = this.address;
      }

      const res = await this.authService.register(payload.email, payload.password, [payload.role]);
      this.success.set(res.message || 'Registration successful! Verification required.');
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 6000);
    } catch (err: any) {
      console.error(err);
      this.error.set(err.error?.message || 'Registration failed. Please check inputs.');
    } finally {
      this.loading.set(false);
    }
  }
}
