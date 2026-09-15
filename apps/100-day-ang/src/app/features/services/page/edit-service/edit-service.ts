import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { toast } from 'ngx-sonner';

import { FormService } from '../../components/form-service';
import type { ServiceFormValue, UpdateServicePayload } from '../../models/services.model';
import { ServiceFacade } from '../../service.facade';
import { CategoryFacade } from '../../../categories/category.facade';

@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.html',
  imports: [FormService, RouterLink],
  providers: [ServiceFacade, CategoryFacade],
})
export class EditService {
  readonly facade = inject(ServiceFacade);
  readonly categoryFacade = inject(CategoryFacade);

  readonly service = this.facade.service;
  readonly isLoading = this.facade.isLoading;
  readonly errorMessage = this.facade.errorMessage;
  readonly isSaving = this.facade.isSaving;
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const serviceId = params.get('serviceId');

      if (!serviceId) {
        this.errorMessage.set('Service ID is missing.');
        this.isLoading.set(false);
        return;
      }

      this.facade.load(serviceId);
      this.categoryFacade.loadCategories();
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

    this.facade.update(service.id, payload);
  }
}
