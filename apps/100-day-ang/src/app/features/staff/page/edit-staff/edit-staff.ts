import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import { StaffForm } from '../../components/staff-form/staff-form';
import type { StaffFormValue, StaffMember } from '../../models/staff.model';
import { StaffService } from '../../services/staff.service';

@Component({
  selector: 'app-edit-staff',
  templateUrl: './edit-staff.html',
  imports: [RouterLink, StaffForm],
})
export class EditStaff {
  readonly staff = signal<StaffMember | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly staffService = inject(StaffService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const staffId = params.get('staffId');

      if (!staffId) {
        this.errorMessage.set('Staff ID is missing.');
        this.isLoading.set(false);
        return;
      }

      this.loadStaff(staffId);
    });
  }

  updateStaff(formValue: StaffFormValue): void {
    const staff = this.staff();

    if (!staff || this.isSaving()) {
      return;
    }

    const payload: StaffFormValue = {
      name: formValue.name.trim(),
      email: formValue.email.trim().toLowerCase(),
      status: formValue.status,
    };

    this.isSaving.set(true);

    this.staffService
      .update(staff.id, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          toast.success('Staff member updated');
          void this.router.navigateByUrl('/staff');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.message ?? 'Unable to update staff member.');
        },
      });
  }

  private loadStaff(staffId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.staffService
      .detail(staffId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (staff) => this.staff.set(staff),
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.message ?? 'Unable to load this staff member. Please try again.',
          );
        },
      });
  }
}
