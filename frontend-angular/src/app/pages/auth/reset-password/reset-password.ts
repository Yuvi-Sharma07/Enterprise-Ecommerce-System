import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html'
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  token = '';
  password = '';
  success = signal<string>('');
  error = signal<string>('');
  loading = signal<boolean>(false);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
    });
  }

  async onSubmit() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    if (!this.token) {
      this.error.set('Reset token is missing.');
      this.loading.set(false);
      return;
    }

    try {
      const res = await this.authService.resetPassword(this.token, this.password);
      this.success.set(res.message || 'Password reset successfully! Redirecting to login.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      this.error.set(err.error?.message || 'Failed to reset password. Token may be invalid.');
    } finally {
      this.loading.set(false);
    }
  }
}
