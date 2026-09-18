import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBriefcaseBusiness,
  lucideCalendarDays,
  lucideLayoutDashboard,
  lucideTags,
  lucideUserRound,
  lucideUsers,
  lucideLogOut,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
} from '@ng-icons/lucide';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { MockAuthService } from '../../features/auth/services/mock-auth.service';
import { AuthStore } from '../../features/auth/store/auth.store';
import { SIDEBAR_NAV_GROUPS } from '../constants/sidebar-navigation';
import { hasPermission } from '../../core/authorization/access-control';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      lucideBriefcaseBusiness,
      lucideCalendarDays,
      lucideLayoutDashboard,
      lucideTags,
      lucideUserRound,
      lucideUsers,
      lucideLogOut,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
    }),
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly authService = inject(MockAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly navigationGroups = computed(() => {
    const role = this.authStore.user()?.role;

    return SIDEBAR_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(role, item.permission)),
    })).filter((group) => group.items.length > 0);
  });
  readonly isSigningOut = signal(false);
  readonly isCollapsed = signal(false);
  signOut(): void {
    if (this.isSigningOut()) return;

    this.isSigningOut.set(true);

    this.authService
      .logout()
      .pipe(finalize(() => this.isSigningOut.set(false)))
      .subscribe({
        next: () => {
          this.authStore.setUnauthenticated();
          toast.success('Signed out successfully.');
          this.router.navigateByUrl('/auth/login');
        },
        error: () => {
          toast.error('Unable to sign out. Please try again.');
        },
      });
  }
  toggleSidebar(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }
}
