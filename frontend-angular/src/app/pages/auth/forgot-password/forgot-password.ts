import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  email = '';
  success = signal<string>('');
  error = signal<string>('');
  loading = signal<boolean>(false);

  async onSubmit() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);
    try {
      const res = await this.authService.forgotPassword(this.email);
      this.success.set(res.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      console.error(err);
      this.error.set(err.error?.message || 'Error occurred. Please verify email exists.');
    } finally {
      this.loading.set(false);
    }
  }
}
