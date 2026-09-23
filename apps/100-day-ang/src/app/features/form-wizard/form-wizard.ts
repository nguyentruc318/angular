import { Component, computed, inject, viewChild } from '@angular/core';
import { AccessSettingsSection } from './sections/access-settings-section/access-settings-section';
import { BasicInfoSection } from './sections/basic-info-section/basic-info-section';
import { WorkInfoSection } from './sections/work-info-section/work-info-section';
import { formWizardStore } from './form-wizard.store';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.html',
  imports: [BasicInfoSection, WorkInfoSection, AccessSettingsSection],
  providers: [formWizardStore],
})
export class FormWizard {
  private readonly formWizardStore = inject(formWizardStore);
  private readonly basicInfoSection = viewChild(BasicInfoSection);
  private readonly workInfoSection = viewChild(WorkInfoSection);
  private readonly accessSettingsSection = viewChild(AccessSettingsSection);

  readonly steps = ['Basic information', 'Work details', 'Access settings'];
  readonly progress = computed(
    () => ((this.formWizardStore.currentStep() + 1) / this.steps.length) * 100,
  );
  readonly currentStep = this.formWizardStore.currentStep;
  readonly isComplete = this.formWizardStore.isComplete;

  previous(): void {
    this.formWizardStore.setStep(Math.max(0, this.currentStep() - 1));
  }

  next(): void {
    const section = [
      this.basicInfoSection(),
      this.workInfoSection(),
      this.accessSettingsSection(),
    ][this.currentStep()];

    if (!section?.save()) {
      this.formWizardStore.setError('Please check the information in this step.');
      return;
    }

    this.formWizardStore.setError(null);
    this.formWizardStore.setStep(Math.min(this.steps.length - 1, this.currentStep() + 1));
  }

  submit(): void {
    if (!this.accessSettingsSection()?.save()) {
      this.formWizardStore.setError('Please check the information in this step.');
      return;
    }

    this.formWizardStore.setError(null);
    const payload = this.formWizardStore.draft();
    console.log('form payload', payload);
    this.formWizardStore.setComplete(true);
  }

  startOver(): void {
    this.formWizardStore.reset();
  }
}