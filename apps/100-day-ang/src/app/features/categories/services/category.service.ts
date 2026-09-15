import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  CategoryListParams,
  CategoryListResult,
  CategoryServiceItem,
  CategoryWithServices,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  JsonServerPageResponse,
  Category,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoriesUrl = `${environment.mockApiBaseUrl}/categories`;
  private readonly servicesUrl = `${environment.mockApiBaseUrl}/services`;
  listWithServices(params: CategoryListParams): Observable<CategoryListResult> {
    const page = Math.max(1, params.page ?? 1);
    const perPage = params.perPage ?? 2;
    const sortBy = params.sortBy ?? 'name';
    const direction = params.direction ?? 'asc';

    let httpParams = new HttpParams()
      .set('_embed', 'services')
      .set('_page', page)
      .set('_per_page', perPage)
      .set('_sort', direction === 'desc' ? `-${sortBy}` : sortBy);

    if (params.search) {
      httpParams = httpParams.set('name:contains', params.search);
    }

    if (params.isActive !== undefined) {
      httpParams = httpParams.set('isActive:eq', String(params.isActive));
    }

    return this.http
      .get<JsonServerPageResponse<CategoryWithServices>>(this.categoriesUrl, {
        params: httpParams,
      })
      .pipe(
        map((response) => ({
          data: response.data,
          pagination: {
            page,
            perPage,
            total: response.items,
            totalPages: response.pages,
          },
        })),
      );
  }
  detail(categoryId: string): Observable<CategoryWithServices> {
    return this.http.get<CategoryWithServices>(
      `${this.categoriesUrl}/${encodeURIComponent(categoryId)}?_embed=services`,
    );
  }

  update(categoryId: string, payload: UpdateCategoryRequest): Observable<CategoryWithServices> {
    return this.http.patch<CategoryWithServices>(
      `${this.categoriesUrl}/${encodeURIComponent(categoryId)}`,
      payload,
    );
  }

  updateServiceCategory(
    serviceId: string,
    categoryId: string | null,
  ): Observable<CategoryServiceItem> {
    return this.http.patch<CategoryServiceItem>(
      `${this.servicesUrl}/${encodeURIComponent(serviceId)}`,
      { categoryId },
    );
  }
  create(payload: CreateCategoryRequest): Observable<CreateCategoryResponse> {
    return this.http.post<CreateCategoryResponse>(this.categoriesUrl, payload);
  }
  listServices(): Observable<CategoryServiceItem[]> {
    return this.http.get<CategoryServiceItem[]>(this.servicesUrl);
  }
  remove(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${encodeURIComponent(categoryId)}`);
  }
  listAll(): Observable<Category[]> {
    const params = new HttpParams().set('_sort', 'name');

    return this.http.get<Category[]>(this.categoriesUrl, { params });
  }
}
