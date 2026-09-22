import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { inject, signal, output, Component } from '@angular/core';
import { StaffStatus } from '../../models/staff.model';
import { SelectOption } from '../../../../shared/components/select/select';
type CreateStaffPayload = {
  name: string;
  email: string;
  status: StaffStatus;
};
@Component({
  selector: 'tr[staff-row]',
  templateUrl: './staff-row.html',
  imports: [ReactiveFormsModule],
  host: {
    class: 'bg-violet-50/50 transition-colors',
  },
})
export class StaffComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly isAddingStaff = signal(false);
  readonly submitted = output<CreateStaffPayload>();
  addStaffForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    status: this.formBuilder.nonNullable.control<StaffStatus>('active', Validators.required),
  });
  readonly statusOptions: readonly SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  showAddRow(): void {
    this.addStaffForm.reset({
      name: '',
      email: '',
      status: 'active',
    });
    this.isAddingStaff.set(true);
  }

  cancelAddStaff(): void {
    this.isAddingStaff.set(false);
  }

  saveStaff(): void {
    if (this.addStaffForm.invalid) {
      this.addStaffForm.markAllAsTouched();
      return;
    }

    const value = this.addStaffForm.getRawValue();
    this.submitted.emit(value);
    this.isAddingStaff.set(false);
  }
}
