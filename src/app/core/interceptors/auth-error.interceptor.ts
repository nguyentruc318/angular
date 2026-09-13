import { inject } from '@angular/core';
import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthStore } from '../../features/auth/store/auth.store';

const RETRIED_AFTER_REFRESH = new HttpContextToken(() => false);

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthRequest =
    req.url.endsWith('/auth/sign-in') ||
    req.url.endsWith('/auth/refresh') ||
    req.url.endsWith('/auth/logout');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const alreadyRetried = req.context.get(RETRIED_AFTER_REFRESH);

      if (error.status !== 401 || isAuthRequest || alreadyRetried) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap(() =>
          next(
            req.clone({
              context: req.context.set(RETRIED_AFTER_REFRESH, true),
            }),
          ),
        ),
        catchError((refreshError) => {
          authStore.setUnauthenticated();
          router.navigateByUrl('/auth/login');

          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
