import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import type { Customer, CustomerPagination } from './models/customer.model';
import { CustomerService } from './services/customer.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.html',
})
export class Customers {
  private readonly customerService = inject(CustomerService);
  readonly customers = signal<Customer[]>([]);
  readonly pagination = signal<CustomerPagination | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  ngOnInit(): void {
    this.loadCustomers();
  }
  loadCustomers(page = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.customerService
      .list(page)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.customers.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.error?.message ?? 'Unable to load customers. Please try again.',
          );
        },
      });
  }
}
