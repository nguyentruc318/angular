import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
import type {
  CreateServicePayload,
  ServiceDetailResponse,
  ServiceListParams,
  ServiceListResponse,
  UpdateServicePayload,
} from '../models/services.model';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);

  list({ page = 1, limit = 10, categoryId, search, status, isPopular }: ServiceListParams = {}) {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }

    if (search) {
      params = params.set('search', search);
    }

    if (status !== undefined) {
      params = params.set('status', status);
    }

    if (isPopular !== undefined) {
      params = params.set('isPopular', isPopular);
    }

    return this.http.get<ServiceListResponse>(`${environment.apiBaseUrl}/services`, { params });
  }
  detail(serviceId: string) {
    return this.http.get<ServiceDetailResponse>(`${environment.apiBaseUrl}/services/${serviceId}`);
  }
  update(serviceId: string, payload: UpdateServicePayload) {
    const formData = new FormData();

    formData.append('categoryId', payload.categoryId);
    formData.append('name', payload.name);
    formData.append('priceMinor', String(payload.priceMinor));
    formData.append('durationMinutes', String(payload.durationMinutes));
    formData.append('status', String(payload.status));
    formData.append('isPopular', String(payload.isPopular));

    if (payload.description) {
      formData.append('description', payload.description);
    }

    if (payload.file) {
      formData.append('file', payload.file);
    }

    return this.http.put(`${environment.apiBaseUrl}/services/update/${serviceId}`, formData);
  }
  create(payload: CreateServicePayload) {
    const formData = new FormData();

    formData.append('categoryId', payload.categoryId);
    formData.append('name', payload.name);
    formData.append('priceMinor', String(payload.priceMinor));
    formData.append('durationMinutes', String(payload.durationMinutes));
    formData.append('status', String(payload.status));
    formData.append('isPopular', String(payload.isPopular));

    if (payload.description) {
      formData.append('description', payload.description);
    }

    formData.append('file', payload.file);

    return this.http.post(`${environment.apiBaseUrl}/services/create`, formData);
  }
}
