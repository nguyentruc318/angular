import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StaffForm } from '../../components/staff-form/staff-form';
import type { StaffFormValue } from '../../models/staff.model';
import { StaffFacade } from '../../staff.facade';

@Component({
  selector: 'app-create-staff',
  templateUrl: './create-staff.html',
  imports: [RouterLink, StaffForm],
  providers: [StaffFacade],
})
export class CreateStaff {
  readonly facade = inject(StaffFacade);

  createStaff(formValue: StaffFormValue): void {
    this.facade.createStaff(formValue);
  }
}
