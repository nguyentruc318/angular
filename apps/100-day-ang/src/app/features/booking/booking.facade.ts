import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';

import { QueryParamsService } from '../../core/services/query-params.service';
import { SelectOption } from '../../shared/components/select/select';
import { formatLabel } from '../../shared/utils/format-label';
import {
  BOOKING_STATUSES,
  Booking,
  BookingListParams,
  BookingPagination,
  BookingStatus,
} from './models/booking.model';
import { BookingService } from './services/booking.service';
import { TabOption } from 'shared';
@Injectable()
export class BookingFacade {
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = inject(QueryParamsService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchChanges$ = new Subject<string>();
  readonly fromDate = signal<string | null>(null);
  readonly toDate = signal<string | null>(null);
  readonly bookings = signal<Booking[]>([]);
  readonly pagination = signal<BookingPagination | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly status = signal<BookingStatus | null>(null);
  readonly updatingBookingId = signal<string | null>(null);

  readonly statusTabs: readonly TabOption[] = [
    { value: '', label: 'All statuses' },
    ...BOOKING_STATUSES.map((status) => ({
      value: status,
      label: formatLabel(status),
    })),
  ];
  readonly bookingStatusOptions: SelectOption[] = BOOKING_STATUSES.map((status) => ({
    value: status,
    label: formatLabel(status),
  }));

  init(): void {
    this.listenToQueryParams();
    this.listenToSearch();
  }

  updateSearch(value: string): void {
    this.search.set(value);
    this.searchChanges$.next(value.trim());
  }

  updateStatusFilter(value: string): void {
    void this.queryParams.merge(this.route, {
      page: 1,
      status: value || null,
    });
  }

  changePage(page: number): void {
    const pageInfo = this.pagination();

    if (!pageInfo || page < 1 || page > pageInfo.totalPages || this.isLoading()) {
      return;
    }

    void this.queryParams.merge(this.route, { page });
  }

  isBookingStatusUpdating(bookingId: string): boolean {
    return this.updatingBookingId() === bookingId;
  }

  updateBookingStatus(booking: Booking, value: string): void {
    const status = value as BookingStatus;

    if (booking.status === status) {
      return;
    }

    this.updatingBookingId.set(booking.id);

    this.bookingService
      .updateStatus(booking.id, status)
      .pipe(finalize(() => this.updatingBookingId.set(null)))
      .subscribe({
        next: () => {
          this.loadBookings({
            page: this.pagination()?.page ?? 1,
            search: this.search(),
            status: this.status() ?? undefined,
          });
        },
      });
  }

  private listenToQueryParams(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page')) || 1;
      const search = params.get('search') ?? '';
      const status = params.get('status') as BookingStatus | null;
      const from = params.get('from');
      const to = params.get('to');
      this.search.set(search);
      this.status.set(status);
      this.fromDate.set(from);
      this.toDate.set(to);
      this.loadBookings({
        page,
        search,
        status: status ?? undefined,
        from: from ?? undefined,
        to: to ?? undefined,
      });
    });
  }

  private listenToSearch(): void {
    this.searchChanges$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        void this.queryParams.merge(this.route, {
          page: 1,
          search: search || null,
          status: this.status(),
        });
      });
  }

  private loadBookings(params: BookingListParams): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.bookingService
      .list({ limit: 10, ...params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.bookings.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (error: HttpErrorResponse) => {
          this.bookings.set([]);
          this.pagination.set(null);
          this.errorMessage.set(error.error?.message ?? 'Unable to load bookings.');
        },
      });
  }
  updateDateFilter(range: { start: Date; end: Date }): void {
    void this.queryParams.merge(this.route, {
      from: this.toDateParam(range.start),
      to: this.toDateParam(range.end),
      page: 1,
    });
  }
  private toDateParam(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  clearFilters(): void {
    this.updateSearch('');

    void this.queryParams.merge(this.route, {
      search: null,
      status: null,
      from: null,
      to: null,
      page: 1,
    });
  }
}
