import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
@Component({
  selector: 'lib-shared-modal',
  templateUrl: './modal.html',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideX })],
})
export class Modal {
  readonly isOpen = input(false);
  readonly title = input('');

  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
