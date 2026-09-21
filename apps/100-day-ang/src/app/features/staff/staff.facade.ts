import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
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

import { QueryParamsService } from '../../core/services/query-params.service';
import type {
  StaffFormValue,
  StaffListParams,
  StaffMember,
  StaffPagination,
  StaffStatus,
} from './models/staff.model';
import { StaffService } from './services/staff.service';

@Injectable()
export class StaffFacade {
  private readonly staffService = inject(StaffService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = inject(QueryParamsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges$ = new Subject<string>();

  readonly staffMembers = signal<StaffMember[]>([]);
  readonly pagination = signal<StaffPagination | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly listParams = signal<StaffListParams>({ page: 1, limit: 10 });
  readonly search = computed(() => this.listParams().search ?? '');
  readonly status = computed(() => this.listParams().status ?? null);
  readonly hasFilters = computed(() => Boolean(this.search().trim() || this.status()));
  readonly firstItem = computed(() => {
    const page = this.pagination();
    return page && page.total > 0 ? (page.page - 1) * page.limit + 1 : 0;
  });
  readonly lastItem = computed(() => {
    const page = this.pagination();
    return page ? Math.min(page.page * page.limit, page.total) : 0;
  });

  init(): void {
    this.listenToQueryParams();
    this.listenToSearch();
  }

  updateSearch(value: string): void {
    this.listParams.update((params) => ({ ...params, search: value }));
    this.searchChanges$.next(value.trim());
  }

  updateStatusFilter(value: string): void {
    const status = value === 'active' || value === 'inactive' ? value : null;

    void this.queryParams.merge(this.route, {
      page: 1,
      status,
    });
  }

  changePage(page: number): void {
    const pagination = this.pagination();

    if (!pagination || this.isLoading() || page < 1 || page > pagination.totalPages) {
      return;
    }

    void this.queryParams.merge(this.route, { page });
  }

  clearFilters(): void {
    this.updateSearch('');

    void this.queryParams.merge(this.route, {
      search: null,
      status: null,
      page: 1,
    });
  }

  createStaff(formValue: StaffFormValue): void {
    if (this.isSaving()) {
      return;
    }

    const payload: StaffFormValue = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      status: formValue.status,
    };

    this.isSaving.set(true);

    this.staffService
      .create(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          toast.success('Staff member created');
          void this.router.navigateByUrl('/staff');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to create staff member.');
        },
      });
  }
  removeStaff(member: StaffMember): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    this.staffService
      .remove(member.id)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.staffMembers.update((members) => members.filter((item) => item.id !== member.id));

          const pagination = this.pagination();
          if (pagination) {
            const total = Math.max(0, pagination.total - 1);
            const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
            this.pagination.set({ ...pagination, total, totalPages });

            if (pagination.page > totalPages) {
              void this.queryParams.merge(this.route, { page: totalPages });
            }
          }

          toast.success('Staff member deleted');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to delete staff member.');
        },
      });
  }
  private listenToSearch(): void {
    this.searchChanges$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
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

          return this.staffService.list(params).pipe(
            tap((response) => {
              this.staffMembers.set(response.data);
              this.pagination.set(response.pagination);
            }),
            catchError((error: HttpErrorResponse) => {
              this.staffMembers.set([]);
              this.pagination.set(null);
              this.errorMessage.set(
                error.error?.message ?? 'Unable to load staff. Please try again.',
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

  private toListParams(params: ParamMap): StaffListParams {
    const requestedStatus = params.get('status');
    const status: StaffStatus | undefined =
      requestedStatus === 'active' || requestedStatus === 'inactive' ? requestedStatus : undefined;

    return {
      page: Math.max(1, Number(params.get('page')) || 1),
      limit: 10,
      search: params.get('search')?.trim() || undefined,
      status,
    };
  }
}
