import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { hasPermission, type Permission } from '../authorization/access-control';
import { AuthStore } from '../../features/auth/store/auth.store';

export const permissionGuard =
  (permission: Permission): CanActivateFn =>
  () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (hasPermission(authStore.user()?.role, permission)) {
      return true;
    }

    return router.createUrlTree(['/bookings']);
  };
