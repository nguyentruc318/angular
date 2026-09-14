import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, Subject } from 'rxjs';

import { QueryParamsService } from '../../core/services/query-params.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import type {
  ManagementService,
  ServiceListParams,
  ServicePagination,
} from './models/services.model';
import { ServicesService } from './services/services.service';
import { SearchInputComponent } from '../../shared/components/search/search';

@Component({
  selector: 'app-services',
  templateUrl: './services.html',
  imports: [PaginationComponent, SearchInputComponent, RouterLink],
})
export class Services implements OnInit {
  private readonly servicesService = inject(ServicesService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = inject(QueryParamsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<ManagementService[]>([]);
  readonly pagination = signal<ServicePagination | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly search = signal('');
  private readonly searchChanges = new Subject<string | null>();

  onSearchChange(search: string): void {
    this.search.set(search);
    this.searchChanges.next(search);
  }
  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page')) || 1;
      const search = params.get('search') || null;
      this.loadServices({ page, search: search || undefined });
    });
    this.searchChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => {
        void this.queryParams.merge(this.route, { search: search || undefined, page: 1 });
      });
  }

  changePage(page: number): void {
    const pageInfo = this.pagination();

    if (!pageInfo || page < 1 || page > pageInfo.totalPages || this.isLoading()) {
      return;
    }

    void this.queryParams.merge(this.route, { page });
  }

  private loadServices(params: ServiceListParams): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.servicesService
      .list({ limit: 10, ...params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.services.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (error: HttpErrorResponse) => {
          this.services.set([]);
          this.pagination.set(null);
          this.errorMessage.set(
            error.error?.error?.message ?? 'Unable to load services. Please try again.',
          );
        },
      });
  }
}
