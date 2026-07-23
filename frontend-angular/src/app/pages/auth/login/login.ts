import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal<string>('');
  loading = signal<boolean>(false);

  async onSubmit() {
    this.error.set('');
    this.loading.set(true);
    try {
      const user = await this.authService.login(this.email, this.password);
      if (user.roles.includes('ROLE_ADMIN')) {
        this.router.navigate(['/admin']);
      } else if (user.roles.includes('ROLE_WAREHOUSE_MANAGER')) {
        this.router.navigate(['/warehouse']);
      } else if (user.roles.includes('ROLE_SUPPLIER')) {
        this.router.navigate(['/supplier']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      console.error(err);
      this.error.set(err.error?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      this.loading.set(false);
    }
  }
}
