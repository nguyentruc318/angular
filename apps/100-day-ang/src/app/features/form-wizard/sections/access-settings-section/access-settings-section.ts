import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from 'shared';
import { formWizardStore } from '../../form-wizard.store';
import { AccessSettings } from '../../form-wizard.model';

@Component({
  selector: 'app-access-settings-section',
  templateUrl: './access-settings-section.html',
  imports: [ReactiveFormsModule, FormErrorComponent],
})
export class AccessSettingsSection {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formWizardStore = inject(formWizardStore);
  private readonly draft = this.formWizardStore.draft().accessSettings;

  readonly form = this.formBuilder.nonNullable.group({
    status: [this.draft.status, Validators.required],
    sendInvite: [this.draft.sendInvite],
    notes: [this.draft.notes, Validators.maxLength(500)],
  });

  readonly errors = {
    status: { required: 'Initial status is required.' },
    notes: { maxlength: 'Notes must not exceed 500 characters.' },
  } as const;

  save(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }

    this.formWizardStore.setAccessSettings(this.form.getRawValue() as AccessSettings);
    return true;
  }
}