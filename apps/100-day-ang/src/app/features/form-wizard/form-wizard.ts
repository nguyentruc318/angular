import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccessSettingsSection } from './sections/access-settings-section/access-settings-section';
import { BasicInfoSection } from './sections/basic-info-section/basic-info-section';
import { WorkInfoSection } from './sections/work-info-section/work-info-section';
import { formWizardStore } from './form-wizard.store';
import { WorkInfoRowFactory } from './form.factory';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.html',
  imports: [ReactiveFormsModule, BasicInfoSection, WorkInfoSection, AccessSettingsSection],
  providers: [formWizardStore, WorkInfoRowFactory],
})
export class FormWizard {
  private readonly formBuilder = inject(FormBuilder);
  private readonly formWizardStore = inject(formWizardStore);
  private readonly workInfoRowFactory = inject(WorkInfoRowFactory);

  readonly steps = ['Basic information', 'Work details', 'Access settings'];
  readonly progress = computed(
    () => ((this.formWizardStore.currentStep() + 1) / this.steps.length) * 100,
  );
}
