import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockAuthService } from '../../services/mock-auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AuthStore } from '../../store/auth.store';
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [ReactiveFormsModule],
})
export class Login {
  private readonly authService = inject(MockAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  readonly isSubmitting = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.minLength(6), Validators.required]],
  });
  clearFieldTouched(field: 'email' | 'password'): void {
    const control = this.loginForm.controls[field];

    if (control.touched) {
      control.markAsUntouched();
    }
  }
  syncField(field: 'email' | 'password', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const control = this.loginForm.controls[field];

    control.setValue(value);
    control.updateValueAndValidity();
    this.clearFieldTouched(field);
  }
  onSubmit(): void {
    if (this.isSubmitting()) return;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.authStore.setAuthenticated();
          this.router.navigateByUrl('/dashboard');
        },
        error: (error: HttpErrorResponse) => {
          toast.error(error.error?.error?.message ?? 'Unable to sign in. Please try again.');
        },
      });
  }
}
