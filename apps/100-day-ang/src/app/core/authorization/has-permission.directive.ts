import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

import { AuthStore } from '../../features/auth/store/auth.store';
import { hasPermission, type Permission } from './access-control';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  readonly appHasPermission = input.required<Permission>();

  private hasView = false;

  constructor() {
    effect(() => {
      const allowed = hasPermission(this.authStore.user()?.role, this.appHasPermission());

      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }

      if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
