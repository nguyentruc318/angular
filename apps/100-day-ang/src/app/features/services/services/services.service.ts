import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../environments/environment.development';
import type {
  CreateServicePayload,
  JsonServerPageResponse,
  ManagementService,
  ManagementServiceApi,
  ServiceDetailResponse,
  ServiceListParams,
  ServiceListResponse,
  UpdateServicePayload,
} from '../models/services.model';

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);
  private readonly servicesUrl = `${environment.mockApiBaseUrl}/services`;
  private readonly categoriesUrl = `${environment.mockApiBaseUrl}/categories`;

  list({ page = 1, limit = 10, categoryId, search, status, isPopular }: ServiceListParams = {}) {
    let params = new HttpParams().set('_page', page).set('_per_page', limit).set('_sort', 'name');

    if (categoryId) {
      params = params.set('categoryId:eq', categoryId);
    }

    if (search) {
      params = params.set('name:contains', search);
    }

    if (status !== undefined) {
      params = params.set('status:eq', String(status));
    }

    if (isPopular !== undefined) {
      params = params.set('isPopular:eq', String(isPopular));
    }

    return forkJoin({
      response: this.http.get<JsonServerPageResponse<ManagementServiceApi>>(this.servicesUrl, {
        params,
      }),
      categories: this.http.get<Array<{ id: string; name: string; slug: string }>>(
        this.categoriesUrl,
      ),
    }).pipe(
      map(({ response, categories }): ServiceListResponse => {
        const categoriesById = new Map(categories.map((category) => [category.id, category]));

        return {
          success: true,
          data: response.data.map((service) => {
            const normalized = this.normalize(service);
            const category = normalized.categoryId
              ? categoriesById.get(normalized.categoryId)
              : undefined;

            return {
              ...normalized,
              categoryName: category?.name ?? null,
              categorySlug: category?.slug ?? null,
            };
          }),
          pagination: {
            page,
            limit,
            total: response.items,
            totalPages: response.pages,
          },
        };
      }),
    );
  }

  detail(serviceId: string): Observable<ServiceDetailResponse> {
    return this.http
      .get<ManagementServiceApi>(`${this.servicesUrl}/${encodeURIComponent(serviceId)}`)
      .pipe(
        map((service) => ({
          success: true,
          data: this.normalize(service),
        })),
      );
  }

  create(payload: CreateServicePayload): Observable<ManagementService> {
    return from(this.readFileAsDataUrl(payload.file)).pipe(
      switchMap((imageUrl) =>
        this.http.post<ManagementServiceApi>(this.servicesUrl, {
          ...this.toRecord(payload),
          categoryName: null,
          categorySlug: null,
          imageUrl,
        }),
      ),
      map((service) => this.normalize(service)),
    );
  }

  update(serviceId: string, payload: UpdateServicePayload): Observable<ManagementService> {
    const image$ = payload.file
      ? from(this.readFileAsDataUrl(payload.file)).pipe(map((imageUrl) => imageUrl))
      : of<string | undefined>(undefined);

    return image$.pipe(
      switchMap((imageUrl) => {
        const record = this.toRecord(payload);

        if (imageUrl) {
          record['imageUrl'] = imageUrl;
        }

        return this.http.patch<ManagementServiceApi>(
          `${this.servicesUrl}/${encodeURIComponent(serviceId)}`,
          record,
        );
      }),
      map((service) => this.normalize(service)),
    );
  }

  private toRecord(payload: UpdateServicePayload): Record<string, unknown> {
    const description = payload.description?.trim() || null;

    return {
      categoryId: payload.categoryId || null,
      name: payload.name.trim(),
      slug: this.slugify(payload.name),
      shortDescription: description ? description.slice(0, 160) : null,
      description,
      isAddon: false,
      isPopular: payload.isPopular,
      requiresConsent: false,
      imageAssetId: null,
      imageAltText: payload.name.trim(),
      priceMinor: payload.priceMinor,
      durationMinutes: payload.durationMinutes,
      status: payload.status,
      isActive: payload.status,
      sortOrder: 0,
      currency: 'USD',
    };
  }

  private normalize(service: ManagementServiceApi): ManagementService {
    const { branchServices, ...flatService } = service;
    const firstBranchService = branchServices?.[0];

    return {
      ...flatService,
      categoryId: service.categoryId ?? null,
      priceMinor: service.priceMinor ?? firstBranchService?.priceMinor ?? 0,
      durationMinutes: service.durationMinutes ?? firstBranchService?.durationMinutes ?? 0,
    };
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
  archive(serviceId: string): Observable<ManagementService> {
    return this.http.patch<ManagementService>(
      `${this.servicesUrl}/${encodeURIComponent(serviceId)}`,
      {
        status: false,
        isActive: false,
      },
    );
  }
}
