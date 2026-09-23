import { Component, inject } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from 'shared';
import { WorkInfoRowFactory } from '../../form.factory';
import { formWizardStore } from '../../form-wizard.store';
import { WorkInfor } from '../../form-wizard.model';

@Component({
  selector: 'app-work-info-section',
  templateUrl: './work-info-section.html',
  imports: [ReactiveFormsModule, FormErrorComponent],
  providers: [WorkInfoRowFactory],
})
export class WorkInfoSection {
  private readonly formWizardStore = inject(formWizardStore);
  private readonly workInfoRowFactory = inject(WorkInfoRowFactory);
  readonly form = new FormArray<FormGroup>(
    this.formWizardStore.draft().workInfo.map((value) => this.workInfoRowFactory.create(value)),
  );

  readonly errors = {
    department: { required: 'Department is required.' },
    role: { required: 'Role is required.' },
    job: { required: 'Job is required.' },
    manager: { required: 'Manager is required.' },
  } as const;

  addRow(): void {
    this.form.push(this.workInfoRowFactory.create());
  }

  removeRow(index: number): void {
    if (this.form.length > 1) this.form.removeAt(index);
  }

  save(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }

    this.formWizardStore.setWorkInfo(this.form.getRawValue() as WorkInfor[]);
    return true;
  }
}