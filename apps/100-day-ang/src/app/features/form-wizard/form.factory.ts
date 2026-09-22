import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { WorkInfor } from './form-wizard.model';

@Injectable()
export class WorkInfoRowFactory {
  private readonly formBuilder = inject(FormBuilder);

  create(value: Partial<WorkInfor> = {}) {
    return this.formBuilder.nonNullable.group({
      department: [value.department ?? '', Validators.required],
      role: [value.role ?? '', Validators.required],
      job: [value.job ?? '', Validators.required],
      manager: [value.manager ?? '', Validators.required],
    });
  }
}
