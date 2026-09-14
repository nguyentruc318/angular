import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-layout/admin').then((m) => m.AdminLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/booking/booking').then((m) => m.Booking),
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers').then((m) => m.Customers),
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./features/services/services').then((m) => m.Services),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/services/page/create-service/create-service').then(
                (m) => m.CreateService,
              ),
          },
          {
            path: ':serviceId/edit',
            loadComponent: () =>
              import('./features/services/page/edit-service/edit-service').then(
                (m) => m.EditService,
              ),
          },
        ],
      },
      {
        path: 'categories',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./features/categories/category').then((m) => m.Categories),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/categories/page/create-category/create-category').then(
                (m) => m.CreateCategory,
              ),
          },
        ],
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/staff/staff').then((m) => m.Staff),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: '**',
        redirectTo: 'dashboard',
      },
    ],
  },
];
