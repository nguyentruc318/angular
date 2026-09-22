import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

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
        canActivate: [permissionGuard('dashboard:view')],
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'bookings',
        canActivate: [permissionGuard('booking:view')],
        loadComponent: () => import('./features/booking/booking').then((m) => m.Booking),
      },
      {
        path: 'customers',
        canActivate: [permissionGuard('customer:view')],
        loadComponent: () => import('./features/customers/customers').then((m) => m.Customers),
      },
      {
        path: 'services',
        canActivate: [permissionGuard('service:view')],
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./features/services/services').then((m) => m.Services),
          },
          {
            path: 'create',
            canActivate: [permissionGuard('service:create')],
            loadComponent: () =>
              import('./features/services/page/create-service/create-service').then(
                (m) => m.CreateService,
              ),
          },
          {
            path: ':serviceId/edit',
            canActivate: [permissionGuard('service:update')],
            loadComponent: () =>
              import('./features/services/page/edit-service/edit-service').then(
                (m) => m.EditService,
              ),
          },
        ],
      },
      {
        path: 'categories',
        canActivate: [permissionGuard('category:view')],
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./features/categories/category').then((m) => m.Categories),
          },
          {
            path: 'create',
            canActivate: [permissionGuard('category:create')],
            loadComponent: () =>
              import('./features/categories/page/create-category/create-category').then(
                (m) => m.CreateCategory,
              ),
          },
          {
            path: ':categoryId/edit',
            canActivate: [permissionGuard('category:update')],
            loadComponent: () =>
              import('./features/categories/page/edit-category/edit-category').then(
                (m) => m.EditCategory,
              ),
          },
        ],
      },
      {
        path: 'staff',
        canActivate: [permissionGuard('staff:view')],
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./features/staff/staff').then((m) => m.Staff),
          },
          {
            path: 'create',
            canActivate: [permissionGuard('staff:create')],
            loadComponent: () =>
              import('./features/staff/page/create-staff/create-staff').then((m) => m.CreateStaff),
          },
          {
            path: ':staffId/edit',
            canActivate: [permissionGuard('staff:update')],
            loadComponent: () =>
              import('./features/staff/page/edit-staff/edit-staff').then((m) => m.EditStaff),
          },
        ],
      },
      {
        path: 'form-wizard',
        loadComponent: () =>
          import('./features/form-wizard/form-wizard').then((m) => m.FormWizard),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
