import { AbstractControl } from '@angular/forms';

export type ErrorMessageFactory = (error: unknown, label: string) => string;

function num(error: unknown, key: string): string | number {
  const value = (error as Record<string, unknown>)?.[key];
  return typeof value === 'number' || typeof value === 'string' ? value : '';
}

export const DEFAULT_ERROR_MESSAGES: Record<string, ErrorMessageFactory> = {
  required: (_error, label) => `Vui lòng nhập ${label}.`,
  email: () => 'Email không đúng định dạng.',
  min: (error) => `Giá trị tối thiểu là ${num(error, 'min')}.`,
  max: (error) => `Giá trị tối đa là ${num(error, 'max')}.`,
  minlength: (error) => `Tối thiểu ${num(error, 'requiredLength')} ký tự.`,
  maxlength: (error) => `Tối đa ${num(error, 'requiredLength')} ký tự.`,
  pattern: () => 'Định dạng không đúng.',
  numericOnly: () => 'Chỉ được nhập ký tự số.',
  urlFormat: () => 'Định dạng không đúng. Vui lòng thử lại.',
  integrationCode: () => 'Mã không hợp lệ.',
  dateRangeOrder: () =>
    'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.',
  dateRangeMaxDays: (error) =>
    `Khoảng thời gian tối đa ${num(error, 'maxDays')} ngày.`,
};

export const DEFAULT_ERROR_ORDER = Object.keys(DEFAULT_ERROR_MESSAGES);

export interface FieldErrorOptions {
  messages?: Record<string, string>;
  label?: string;
  order?: string[];
}

export function resolveFieldError(
  control: AbstractControl | null | undefined,
  options: FieldErrorOptions = {}
): string | null {
  if (!control?.errors || !(control.touched || control.dirty)) return null;

  const {
    messages = {},
    label = 'thông tin',
    order = DEFAULT_ERROR_ORDER,
  } = options;
  const errorKeys = Object.keys(control.errors);
  const orderedKeys = [
    ...order.filter((key) => errorKeys.includes(key)),
    ...errorKeys.filter((key) => !order.includes(key)),
  ];

  for (const key of orderedKeys) {
    if (messages[key]) return messages[key];
    const factory = DEFAULT_ERROR_MESSAGES[key];
    if (factory) return factory(control.getError(key), label);
  }
  return null;
}
