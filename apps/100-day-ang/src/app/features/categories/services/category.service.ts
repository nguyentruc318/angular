import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  CategoryListParams,
  CategoryListResult,
  CategoryWithServices,
  CreateCategoryRequest,
  CreateCategoryResponse,
  JsonServerPageResponse,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly categoriesUrl = `${environment.mockApiBaseUrl}/categories`;

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
  create(payload: CreateCategoryRequest): Observable<CreateCategoryResponse> {
    return this.http.post<CreateCategoryResponse>(this.categoriesUrl, payload);
  }
}
