import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from 'shared';

@Component({
  selector: 'app-work-info-section',
  templateUrl: './work-info-section.html',
  imports: [ReactiveFormsModule, FormErrorComponent],
})
export class WorkInfoSection {
  readonly group = input.required<FormGroup>();
  readonly errors = {
    department: { required: 'Department is required.' },
    role: { required: 'Role is required.' },
    job: { required: 'Job is required.' },
    manager: { required: 'Manager is required.' },
  } as const;
}
