import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SelectComponent, SelectOption } from '../../../../shared/components/select/select';
import type { StaffFormValue, StaffMember, StaffStatus } from '../../models/staff.model';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.html',
  imports: [ReactiveFormsModule, SelectComponent],
})
export class StaffForm {
  private readonly formBuilder = inject(FormBuilder);

  readonly initialValue = input<StaffMember | null>(null);
  readonly isSubmitting = input(false);
  readonly submitLabel = input('Create staff');
  readonly submitted = output<StaffFormValue>();
  readonly statusOptions: readonly SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    status: this.formBuilder.nonNullable.control<StaffStatus>('active', Validators.required),
  });

  constructor() {
    effect(() => {
      const staff = this.initialValue();

      if (!staff) {
        return;
      }

      this.form.patchValue(
        {
          name: staff.name,
          email: staff.email,
          status: staff.status,
        },
        { emitEvent: false },
      );
    });
  }

  onSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  onStatusChange(value: string): void {
    if (value !== 'active' && value !== 'inactive') {
      return;
    }

    this.form.controls.status.setValue(value);
    this.form.controls.status.markAsTouched();
  }
}
