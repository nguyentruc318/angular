import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MockAuthService } from '../../features/auth/services/mock-auth.service';
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs';
import { AuthStore } from '../../features/auth/store/auth.store';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly authService = inject(MockAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly isSigningOut = signal(false);
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
}
