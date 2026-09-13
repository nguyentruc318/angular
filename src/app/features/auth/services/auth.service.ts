import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../models/login-request.model';
import { environment } from '../../../../environments/environment';
import { ApiSuccessResponse, LoginResponse } from '../models/login-response.model';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  login(payload: LoginRequest) {
    return this.http.post<ApiSuccessResponse<LoginResponse>>(
      `${environment.apiBaseUrl}/auth/sign-in`,
      payload,
    );
  }
  logout() {
    return this.http.post(`${environment.apiBaseUrl}/auth/logout`, {});
  }

  me() {
    return this.http.get<ApiSuccessResponse<unknown>>(`${environment.apiBaseUrl}/auth/me`);
  }
  refresh() {
    return this.http.post<ApiSuccessResponse<{ refreshed: boolean }>>(
      `${environment.apiBaseUrl}/auth/refresh`,
      {},
    );
  }
}
