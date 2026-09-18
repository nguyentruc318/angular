import { Injectable, signal } from '@angular/core';
import { MockSessionUser } from '../models/mock-user.model';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly status = signal<AuthStatus>('unknown');
  readonly user = signal<MockSessionUser | null>(null);
  setAuthenticated(user: MockSessionUser): void {
    this.user.set(user);
    this.status.set('authenticated');
  }

  setUnauthenticated(): void {
    this.user.set(null);
    this.status.set('unauthenticated');
  }
}
