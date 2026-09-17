import { Component, HostListener, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'lib-shared-sheet',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './sheet.html',
})
export class SheetDialog {
  readonly isOpen = input(false);
  readonly title = input('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.isOpen()) {
      this.closed.emit();
    }
  }
}
