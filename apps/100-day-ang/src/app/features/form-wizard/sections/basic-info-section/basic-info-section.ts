import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from 'shared';

@Component({
  selector: 'app-basic-info-section',
  templateUrl: './basic-info-section.html',
  imports: [ReactiveFormsModule, FormErrorComponent],
})
export class BasicInfoSection {
  readonly group = input.required<FormGroup>();
  readonly errors = {
    name: { required: 'Full name is required.' },
    email: { required: 'Email address is required.', email: 'Enter a valid email address.' },
    phone: {
      required: 'Phone number is required.',
      pattern: 'Enter a valid Vietnamese phone number, for example 0912345678.',
    },
    dob: { required: 'Date of birth is required.' },
    gender: { required: 'Please select a gender.' },
  } as const;
}
