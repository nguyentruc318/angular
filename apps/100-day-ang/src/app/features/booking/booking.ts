import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import {
  BOOKING_STATUSES,
  type Booking as BookingItem,
  type BookingListParams,
  type BookingPagination,
  type BookingStatus,
} from './models/booking.model';
import { BookingService } from './services/booking.service';
import { SearchInputComponent } from '../../shared/components/search/search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QueryParamsService } from '../../core/services/query-params.service';
import { SelectComponent, type SelectOption } from '../../shared/components/select/select';
import { formatLabel } from '../../shared/utils/format-label';
@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  imports: [PaginationComponent, SearchInputComponent, SelectComponent],
})
export class Booking implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = inject(QueryParamsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges$ = new Subject<string>();
  readonly bookings = signal<BookingItem[]>([]);
  readonly pagination = signal<BookingPagination | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  readonly status = signal<BookingStatus | null>(null);
  readonly updatingBookingId = signal<string | null>(null);
  readonly statusOptions: SelectOption[] = [
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
  onSearchChange(value: string): void {
    this.search.set(value);
    this.searchChanges$.next(value.trim());
  }
  onStatusChange(value: string): void {
    void this.queryParams.merge(this.route, {
      page: 1,
      status: value || null,
    });
  }
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page')) || 1;
      const search = params.get('search') ?? '';
      const status = params.get('status') as BookingStatus | null;
      this.search.set(search);
      this.status.set(status);

      this.loadBookings({
        page,
        search,
        status: status ?? undefined,
      });
    });
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
  isBookingStatusUpdating(bookingId: string): boolean {
    return this.updatingBookingId() === bookingId;
  }
  changePage(page: number): void {
    const pageInfo = this.pagination();

    if (!pageInfo || page < 1 || page > pageInfo.totalPages || this.isLoading()) {
      return;
    }

    void this.queryParams.merge(this.route, { page });
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

          this.errorMessage.set(
            error.error?.error?.message ?? 'Unable to load bookings. Please try again.',
          );
        },
      });
  }
  onBookingStatusChange(booking: BookingItem, value: string): void {
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
          const page = this.pagination()?.page ?? 1;

          this.loadBookings({
            page,
            search: this.search(),
            status: this.status() ?? undefined,
          });
        },
        error: () => {
          // bước sau có thể toast.error(...)
        },
      });
  }
}
