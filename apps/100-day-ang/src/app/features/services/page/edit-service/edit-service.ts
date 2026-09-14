import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormService } from '../../components/form-service';

import {
  ManagementService,
  ServiceFormValue,
  UpdateServicePayload,
} from '../../models/services.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicesService } from '../../services/services.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { toast } from 'ngx-sonner';
@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.html',
  imports: [FormService, RouterLink],
})
export class EditService {
  readonly service = signal<ManagementService | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly servicesService = inject(ServicesService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isSaving = signal(false);
  private readonly router = inject(Router);
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const serviceId = params.get('serviceId');

      if (!serviceId) {
        this.errorMessage.set('Service ID is missing.');
        this.isLoading.set(false);
        return;
      }

      this.loadService(serviceId);
    });
  }
  private loadService(serviceId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.servicesService
      .detail(serviceId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.service.set(response.data);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.error?.message ?? 'Unable to load this service. Please try again.',
          );
        },
      });
  }
  updateService(formValue: ServiceFormValue): void {
    const service = this.service();

    if (!service) {
      return;
    }

    const price = Number(formValue.price);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    const payload: UpdateServicePayload = {
      name: formValue.name.trim(),
      categoryId: formValue.categoryId,
      description: formValue.description.trim() || undefined,
      priceMinor: Math.round(price * 100),
      durationMinutes: formValue.durationMinutes,
      status: formValue.status,
      isPopular: formValue.isPopular,
      file: formValue.imageFile ?? undefined,
    };

    this.isSaving.set(true);

    this.servicesService
      .update(service.id, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          toast.success('Service updated');
          void this.router.navigateByUrl('/services');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.error?.message ?? 'Unable to update service. Please try again.');
        },
      });
  }
}
