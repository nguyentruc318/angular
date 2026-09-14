import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MockAuthService } from '../../features/auth/services/mock-auth.service';
import { AuthStore } from '../../features/auth/store/auth.store';

export const authGuard: CanActivateFn = () => {
  const authService = inject(MockAuthService);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const status = authStore.status();

  if (status === 'authenticated') {
    return true;
  }

  if (status === 'unauthenticated') {
    return router.createUrlTree(['/auth/login']);
  }

  return authService.me().pipe(
    map(() => {
      authStore.setAuthenticated();
      return true;
    }),
    catchError(() => {
      authStore.setUnauthenticated();
      return of(router.createUrlTree(['/auth/login']));
    }),
  );
};
