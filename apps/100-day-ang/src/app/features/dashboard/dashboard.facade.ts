import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';

import {
  BookingStatusPoint,
  PopularServicePoint,
  RevenuePoint,
  RevenueRange,
} from './models/dashboard.model';
import { DashboardService } from './services/dashboard.service';

export type DashboardChartState = 'loading' | 'success' | 'empty' | 'error';

@Injectable()
export class DashboardFacade {
  private readonly dashboardService = inject(DashboardService);
  readonly popularServices = signal<PopularServicePoint[]>([]);
  readonly revenueTrend = signal<RevenuePoint[]>([]);
  readonly selectedRange = signal<RevenueRange>(14);
  readonly bookingStatus = signal<BookingStatusPoint[]>([]);
  readonly chartState = signal<DashboardChartState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly fromDate = signal<string | null>(null);
  readonly toDate = signal<string | null>(null);

  setDateRange(start: Date | null, end: Date | null): void {
    this.fromDate.set(this.toDateKey(start));
    this.toDate.set(this.toDateKey(end));
  }

  private toDateKey(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  readonly visibleRevenue = computed(() => {
    const points = this.revenueTrend();
    const range = this.selectedRange();

    if (range === 'custom') {
      const from = this.fromDate();
      const to = this.toDate();

      return points.filter((point) => {
        const afterStart = !from || point.date >= from;
        const beforeEnd = !to || point.date <= to;

        return afterStart && beforeEnd;
      });
    }

    return points.slice(-range);
  });
  selectRange(value: string): void {
    if (value === 'custom') {
      this.selectedRange.set('custom');
      return;
    }

    const range = Number(value);

    if (range === 7 || range === 14 || range === 30) {
      this.selectedRange.set(range as RevenueRange);
    }
  }
  load(): void {
    this.chartState.set('loading');
    this.errorMessage.set(null);

    this.dashboardService.get().subscribe({
      next: (data) => {
        this.revenueTrend.set(data.revenueTrend);
        this.bookingStatus.set(data.bookingStatus);
        this.popularServices.set(data.popularServices);
        this.chartState.set(data.revenueTrend.length ? 'success' : 'empty');
      },
      error: (error: HttpErrorResponse) => {
        this.revenueTrend.set([]);
        this.popularServices.set([]);
        this.errorMessage.set(error.error?.message ?? 'Unable to load dashboard data.');
        this.chartState.set('error');
      },
    });
  }
}
