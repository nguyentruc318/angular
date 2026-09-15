import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';

import { FormService } from '../../components/form-service';
import type { CreateServicePayload, ServiceFormValue } from '../../models/services.model';
import { ServiceFacade } from '../../service.facade';
import { CategoryFacade } from '../../../categories/category.facade';
@Component({
  selector: 'create-form-service',
  templateUrl: './create-service.html',
  imports: [FormService, RouterLink],
  providers: [ServiceFacade, CategoryFacade],
})
export class CreateService {
  readonly facade = inject(ServiceFacade);
  readonly categoryFacade = inject(CategoryFacade);
  readonly isSaving = this.facade.isSaving;
  ngOnInit(): void {
    this.categoryFacade.loadCategories();
  }
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

    this.facade.create(payload);
  }
}
