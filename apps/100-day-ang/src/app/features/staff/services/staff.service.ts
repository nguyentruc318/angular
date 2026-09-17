import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type {
  StaffFormValue,
  StaffListParams,
  StaffListResponse,
  StaffMember,
} from '../models/staff.model';

interface StaffPageResponse {
  data: StaffMember[];
  items: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly staffUrl = environment.mockApiBaseUrl + '/staff';

  list({ page, limit, search, status }: StaffListParams): Observable<StaffListResponse> {
    let params = new HttpParams().set('_page', page).set('_per_page', limit).set('_sort', 'name');

    const term = search?.trim();
    const where = {
      ...(status ? { status: { eq: status } } : {}),
      ...(term ? { or: [{ name: { contains: term } }, { email: { contains: term } }] } : {}),
    };

    if (Object.keys(where).length > 0) {
      params = params.set('_where', JSON.stringify(where));
    }

    return this.http.get<StaffPageResponse>(this.staffUrl, { params }).pipe(
      map((response) => ({
        data: response.data,
        pagination: {
          page: Math.min(page, Math.max(1, response.pages)),
          limit,
          total: response.items,
          totalPages: Math.max(1, response.pages),
        },
      })),
    );
  }

  create(payload: StaffFormValue): Observable<StaffMember> {
    return this.http.post<StaffMember>(this.staffUrl, payload);
  }

  detail(staffId: string): Observable<StaffMember> {
    return this.http.get<StaffMember>(this.staffUrl + '/' + encodeURIComponent(staffId));
  }

  update(staffId: string, payload: StaffFormValue): Observable<StaffMember> {
    return this.http.patch<StaffMember>(this.staffUrl + '/' + encodeURIComponent(staffId), payload);
  }

  remove(staffId: string): Observable<void> {
    return this.http.delete<void>(this.staffUrl + '/' + encodeURIComponent(staffId));
  }
}
