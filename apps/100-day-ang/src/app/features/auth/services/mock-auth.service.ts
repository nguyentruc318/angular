import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponse, LoginRequest, LoginResponse } from '../models/auth.model';
import { MockSessionUser, MockUser } from '../models/mock-user.model';

const SESSION_KEY = '100-day-ang.mock-user-id';

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.mockApiBaseUrl}/users`;

  login(payload: LoginRequest): Observable<ApiSuccessResponse<LoginResponse>> {
    return defer(() => {
      sessionStorage.removeItem(SESSION_KEY);
      return this.http.get<MockUser[]>(this.usersUrl, {
        params: { email: payload.email.trim().toLowerCase() },
      });
    }).pipe(
      map((users) => {
        const user = users.find((user) => user.password === payload.password);
        if (!user) {
          throw this.unauthorized('Email or password is incorrect.');
        }
        if (!user.isActive) {
          throw this.unauthorized('This account is disabled.');
        }
        sessionStorage.setItem(SESSION_KEY, user.id);
        return { success: true, data: { authenticated: true } };
      }),
    );
  }

  me(): Observable<ApiSuccessResponse<MockSessionUser>> {
    return defer(() => {
      const userId = sessionStorage.getItem(SESSION_KEY);
      if (!userId) {
        return throwError(() => this.unauthorized('Please sign in.'));
      }
      return this.http.get<MockUser>(`${this.usersUrl}/${encodeURIComponent(userId)}`);
    }).pipe(
      map((user) => {
        if (!user.isActive) {
          throw this.unauthorized('This account is disabled.');
        }
        return {
          success: true as const,
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
          },
        };
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 404) {
          sessionStorage.removeItem(SESSION_KEY);
        }
        return throwError(() => error);
      }),
    );
  }

  logout(): Observable<ApiSuccessResponse<null>> {
    return defer(() => {
      sessionStorage.removeItem(SESSION_KEY);
      return of({ success: true as const, data: null });
    });
  }

  refresh(): Observable<ApiSuccessResponse<{ refreshed: boolean }>> {
    return this.me().pipe(map(() => ({ success: true, data: { refreshed: true } })));
  }

  private unauthorized(message: string): HttpErrorResponse {
    return new HttpErrorResponse({ status: 401, error: { error: { message } } });
  }
}
