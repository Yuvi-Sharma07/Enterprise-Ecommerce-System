import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const authService = inject(AuthService);

  // Inject JWT Access Token
  const token = localStorage.getItem('accessToken');
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for 401 and make sure it's not the refresh token request itself
      if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          return http.post<any>(`${API_BASE_URL}/api/auth/refresh-token`, { refreshToken }).pipe(
            switchMap((res) => {
              const { accessToken, refreshToken: newRefreshToken } = res;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Retry the request with the new token
              const newAuthReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${accessToken}`
                }
              });
              return next(newAuthReq);
            }),
            catchError((refreshError) => {
              console.error("Token refresh failed", refreshError);
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
