import type { IconName } from '@ng-icons/core';

export interface SidebarNavItem {
  readonly label: string;
  readonly route: string;
  readonly icon: IconName;
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
      },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Bookings', route: '/bookings', icon: 'lucideCalendarDays' },
      { label: 'Customers', route: '/customers', icon: 'lucideUsers' },
      { label: 'Services', route: '/services', icon: 'lucideBriefcaseBusiness' },
      { label: 'Categories', route: '/categories', icon: 'lucideTags' },
      { label: 'Staff', route: '/staff', icon: 'lucideUserRound' },
    ],
  },
] as const satisfies readonly SidebarNavGroup[];
