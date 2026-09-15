import { Component, input, output } from '@angular/core';

export interface TabOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'lib-shared-tabs',
  standalone: true,
  templateUrl: './tabs.html',
})
export class TabsComponent {
  readonly tabs = input.required<readonly TabOption[]>();
  readonly value = input('');

  readonly valueChange = output<string>();

  selectTab(tab: TabOption): void {
    if (!tab.disabled) {
      this.valueChange.emit(tab.value);
    }
  }
}
