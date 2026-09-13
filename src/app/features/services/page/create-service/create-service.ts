import { Component, inject, signal } from '@angular/core';
import { FormService } from '../../components/form-service';
import { finalize } from 'rxjs';
import { CreateServicePayload, ServiceFormValue } from '../../models/services.model';
import { toast } from 'ngx-sonner';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ServicesService } from '../../services/services.service';

@Component({
  selector: 'create-form-service',
  templateUrl: './create-service.html',
  imports: [FormService],
})
export class CreateService {
  readonly isSaving = signal(false);
  readonly router = inject(Router);
  private readonly servicesService = inject(ServicesService);
  createService(formValue: ServiceFormValue): void {
    const price = Number(formValue.price);

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Please enter a valid price.');
      return;
    }

    if (!formValue.imageFile) {
      toast.error('Please select a service image.');
      return;
    }

    const payload: CreateServicePayload = {
      name: formValue.name.trim(),
      categoryId: formValue.categoryId,
      description: formValue.description.trim() || undefined,
      priceMinor: Math.round(price * 100),
      durationMinutes: formValue.durationMinutes,
      status: formValue.status,
      isPopular: formValue.isPopular,
      file: formValue.imageFile,
    };

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
          toast.error(error.error?.error?.message ?? 'Unable to create service. Please try again.');
        },
      });
  }
}
