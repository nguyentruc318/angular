import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  finalize,
  map,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { toast } from 'ngx-sonner';

import { QueryParamsService } from '../../core/services/query-params.service';
import type {
  CreateServicePayload,
  ManagementService,
  ServiceListParams,
  ServicePagination,
  UpdateServicePayload,
} from './models/services.model';
import { ServicesService } from './services/services.service';

@Injectable()
export class ServiceFacade {
  private readonly servicesService = inject(ServicesService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = inject(QueryParamsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly searchChanges$ = new Subject<string>();

  readonly services = signal<ManagementService[]>([]);
  readonly service = signal<ManagementService | null>(null);
  readonly pagination = signal<ServicePagination | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly listParams = signal<ServiceListParams>({ page: 1, limit: 10 });

  init(): void {
    this.listenToQueryParams();
    this.listenToSearch();
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.searchChanges$.next(value.trim());
  }

  changePage(page: number): void {
    const pageInfo = this.pagination();

    if (!pageInfo || page < 1 || page > pageInfo.totalPages || this.isLoading()) {
      return;
    }

    void this.queryParams.merge(this.route, { page });
  }

  load(serviceId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.set(null);

    this.servicesService
      .detail(serviceId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => this.service.set(response.data),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(error, 'Unable to load this service. Please try again.'),
          );
        },
      });
  }

  create(payload: CreateServicePayload): void {
    this.isSaving.set(true);

    this.servicesService
      .create(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          toast.success('Service created');
          void this.router.navigateByUrl('/services');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(this.getErrorMessage(error, 'Unable to create service. Please try again.'));
        },
      });
  }

  update(serviceId: string, payload: UpdateServicePayload): void {
    this.isSaving.set(true);

    this.servicesService
      .update(serviceId, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          toast.success('Service updated');
          void this.router.navigateByUrl('/services');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(this.getErrorMessage(error, 'Unable to update service. Please try again.'));
        },
      });
  }

  private listenToSearch(): void {
    this.searchChanges$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        void this.queryParams.merge(this.route, { search: search || null, page: 1 });
      });
  }

  private listenToQueryParams(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => this.toListParams(params)),
        tap((params) => {
          this.listParams.set(params);
          this.search.set(params.search ?? '');
        }),
        switchMap((params) => {
          this.isLoading.set(true);
          this.errorMessage.set(null);

          return this.servicesService.list(params).pipe(
            tap((response) => {
              this.services.set(response.data);
              this.pagination.set(response.pagination);
            }),
            catchError((error: HttpErrorResponse) => {
              this.services.set([]);
              this.pagination.set(null);
              this.errorMessage.set(
                this.getErrorMessage(error, 'Unable to load services. Please try again.'),
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

  private toListParams(params: ParamMap): ServiceListParams {
    return {
      page: Math.max(1, Number(params.get('page')) || 1),
      limit: 10,
      search: params.get('search')?.trim() || undefined,
    };
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    return error.error?.message ?? error.error?.error?.message ?? fallback;
  }
  archive(service: ManagementService): void {
    this.isSaving.set(true);

    this.servicesService
      .archive(service.id)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.services.update((services) => services.filter((item) => item.id !== service.id));

          toast.success('Service archived');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(this.getErrorMessage(error, 'Unable to archive service.'));
        },
      });
  }
}
