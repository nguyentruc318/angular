import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from 'shared';
import { formWizardStore } from '../../form-wizard.store';
import { BasicInfor } from '../../form-wizard.model';

@Component({
  selector: 'app-basic-info-section',
  templateUrl: './basic-info-section.html',
  imports: [ReactiveFormsModule, FormErrorComponent],
})
export class BasicInfoSection {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formWizardStore = inject(formWizardStore);
  private readonly draft = this.formWizardStore.draft().basicInfo;

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.draft.name, Validators.required],
    email: [this.draft.email, [Validators.required, Validators.email]],
    phone: [this.draft.phone, [Validators.required, Validators.pattern(/^(?:0|\+84)(?:3|5|7|8|9)\d{8}$/)]],
    dob: this.formBuilder.control<Date | null>(this.draft.dob, Validators.required),
    gender: this.formBuilder.control<string | null>(this.draft.gender, Validators.required),
  });

  readonly errors = {
    name: { required: 'Full name is required.' },
    email: { required: 'Email address is required.', email: 'Enter a valid email address.' },
    phone: { required: 'Phone number is required.', pattern: 'Enter a valid Vietnamese phone number, for example 0912345678.' },
    dob: { required: 'Date of birth is required.' },
    gender: { required: 'Please select a gender.' },
  } as const;

  save(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }

    this.formWizardStore.setBasicInfo(this.form.getRawValue() as BasicInfor);
    return true;
  }
}