import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import type { CustomerListResponse } from '../models/customer.model';
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  list(page = 1, limit = 10) {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get<CustomerListResponse>(`${environment.apiBaseUrl}/customers`, { params });
  }
}
