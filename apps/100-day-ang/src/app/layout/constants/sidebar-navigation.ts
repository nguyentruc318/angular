import type { IconName } from '@ng-icons/core';
import type { Permission } from '../../core/authorization/access-control';

export interface SidebarNavItem {
  readonly label: string;
  readonly route: string;
  readonly icon: IconName;
  readonly permission: Permission;
}

export interface SidebarNavGroup {
  readonly label: string;
  readonly items: readonly SidebarNavItem[];
}

export const SIDEBAR_NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        route: '/dashboard',
        icon: 'lucideLayoutDashboard',
        permission: 'dashboard:view',
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Bookings',
        route: '/bookings',
        icon: 'lucideCalendarDays',
        permission: 'booking:view',
      },
      // {
      //   label: 'Customers',
      //   route: '/customers',
      //   icon: 'lucideUsers',
      //   permission: 'customer:view',
      // },
      {
        label: 'Services',
        route: '/services',
        icon: 'lucideBriefcaseBusiness',
        permission: 'service:view',
      },
      {
        label: 'Categories',
        route: '/categories',
        icon: 'lucideTags',
        permission: 'category:view',
      },
      { label: 'Staff', route: '/staff', icon: 'lucideUserRound', permission: 'staff:view' },
    ],
  },
] as const satisfies readonly SidebarNavGroup[];
