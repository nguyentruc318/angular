import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.development';
import type { DashboardData } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly dashboardUrl = `${environment.mockApiBaseUrl}/dashboard`;

  get(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.dashboardUrl);
  }
}
