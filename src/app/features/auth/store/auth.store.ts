import { Injectable, signal } from '@angular/core';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly status = signal<AuthStatus>('unknown');

  setAuthenticated(): void {
    this.status.set('authenticated');
  }

  setUnauthenticated(): void {
    this.status.set('unauthenticated');
  }
}
