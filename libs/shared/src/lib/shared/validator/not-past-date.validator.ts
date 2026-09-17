import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notPastDate(): ValidatorFn {
  return (control: AbstractControl<Date | null>): ValidationErrors | null => {
    const selectedDate = control.value;

    if (!selectedDate) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return selected < today ? { pastDate: true } : null;
  };
}
