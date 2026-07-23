import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify.html'
})
export class VerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  status = signal<'verifying' | 'success' | 'error'>('verifying');
  message = signal<string>('Verifying your email token address...');

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      const token = params['token'];
      if (!token) {
        this.status.set('error');
        this.message.set('Missing token validation query parameter.');
        return;
      }
      try {
        const res = await this.authService.verifyEmail(token);
        this.status.set('success');
        this.message.set(res.message || 'Email successfully verified! Redirecting to login.');
      } catch (err: any) {
        console.error(err);
        this.status.set('error');
        this.message.set(err.error?.message || 'Verification token is invalid or expired.');
      }
    });
  }
}
