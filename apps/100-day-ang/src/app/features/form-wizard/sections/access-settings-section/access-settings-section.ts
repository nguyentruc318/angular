import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from 'shared';

@Component({
  selector: 'app-access-settings-section',
  templateUrl: './access-settings-section.html',
  imports: [ReactiveFormsModule, FormErrorComponent],
})
export class AccessSettingsSection {
  readonly group = input.required<FormGroup>();
  readonly errors = {
    status: { required: 'Initial status is required.' },
    notes: { maxlength: 'Notes must not exceed 500 characters.' },
  } as const;
}
