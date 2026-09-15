import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  forkJoin,
  of,
  finalize,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import {
  CategoryFormValue,
  CategoryListParams,
  CategoryPagination,
  CategoryWithServices,
  CreateCategoryRequest,
} from './models/category.model';
import { CategoryService } from './services/category.service';
import { QueryParamsService } from '../../core/services/query-params.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectOption } from '../../shared/components/select/select';

@Injectable()
export class CategoryFacade {
  private readonly categoryService = inject(CategoryService);
  readonly categories = signal<CategoryWithServices[]>([]);
  readonly pagination = signal<CategoryPagination | null>(null);
  readonly isLoading = signal(true);
  private readonly searchChanges$ = new Subject<string>();
  readonly errorMessage = signal<string | null>(null);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryParams = inject(QueryParamsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categoryOptions = signal<SelectOption[]>([]);
  readonly isSaving = signal(false);
  readonly listParams = signal<CategoryListParams>({
    page: 1,
    perPage: 10,
    sortBy: 'name',
    direction: 'asc',
  });
  updateSearch(value: string): void {
    this.listParams.update((params) => ({
      ...params,
      search: value,
    }));

    this.searchChanges$.next(value.trim());
  }

  updateActivity(value: string): void {
    void this.queryParams.merge(this.route, {
      page: 1,
      active: value || null,
    });
  }
  updateSort(value: string): void {
    const [, direction] = value.split(':');

    void this.queryParams.merge(this.route, {
      page: 1,
      sort: 'name',
      direction: direction === 'desc' ? 'desc' : 'asc',
    });
  }
  init(): void {
    this.listenToQueryParams();
    this.listenToSearch();
  }
  private listenToSearch(): void {
    this.searchChanges$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        void this.queryParams.merge(this.route, {
          page: 1,
          search: search || null,
        });
      });
  }
  private listenToQueryParams(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => this.toListParams(params)),
        tap((params) => this.listParams.set(params)),
        switchMap((params) => {
          this.isLoading.set(true);
          this.errorMessage.set(null);

          return this.categoryService.listWithServices(params).pipe(
            tap((result) => {
              this.categories.set(result.data);
              this.pagination.set(result.pagination);
            }),
            catchError((error: HttpErrorResponse) => {
              this.categories.set([]);
              this.pagination.set(null);
              this.errorMessage.set(
                error.error?.message ?? 'Unable to load categories. Please try again.',
              );

              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
  private toListParams(params: ParamMap): CategoryListParams {
    const active = params.get('active');

    return {
      page: Math.max(1, Number(params.get('page')) || 1),
      perPage: 10,
      search: params.get('search')?.trim() || undefined,
      isActive: active === 'true' ? true : active === 'false' ? false : undefined,
      sortBy: 'name',
      direction: params.get('direction') === 'desc' ? 'desc' : 'asc',
    };
  }
  create(formValue: CategoryFormValue): void {
    const payload: CreateCategoryRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      imageUrl: formValue.imageUrl.trim() || null,
      isActive: formValue.isActive,
    };

    this.isSaving.set(true);

    this.categoryService
      .create(payload)
      .pipe(
        switchMap((category) => {
          const serviceUpdates = formValue.serviceIds.map((serviceId) =>
            this.categoryService.updateServiceCategory(serviceId, category.id),
          );

          return serviceUpdates.length
            ? forkJoin(serviceUpdates).pipe(map(() => category))
            : of(category);
        }),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => {
          toast.success('Category created');
          void this.router.navigateByUrl('/categories');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to create category. Please try again.');
        },
      });
  }
  removeCategory(category: CategoryWithServices): void {
    const detachRequests = category.services.map((service) =>
      this.categoryService.updateServiceCategory(service.id, null),
    );

    const detachServices$ = detachRequests.length ? forkJoin(detachRequests) : of([]);

    this.isSaving.set(true);

    detachServices$
      .pipe(
        switchMap(() => this.categoryService.remove(category.id)),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => {
          this.categories.update((categories) =>
            categories.filter((item) => item.id !== category.id),
          );

          toast.success('Category deleted');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to delete category.');
        },
      });
  }
  loadCategories(): void {
    this.categoryService
      .listAll()
      .pipe(
        map((categories) =>
          categories
            .filter((category) => category.isActive)
            .map((category) => ({
              value: category.id,
              label: category.name,
            })),
        ),
      )
      .subscribe({
        next: (options) => {
          this.categoryOptions.set(options);
        },
      });
  }
}
