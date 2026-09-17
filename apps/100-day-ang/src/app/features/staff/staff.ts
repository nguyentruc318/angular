import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { Modal, TabsComponent } from 'shared';

import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchInputComponent } from '../../shared/components/search/search';
import type { StaffMember } from './models/staff.model';
import { StaffFacade } from './staff.facade';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.html',
  imports: [TabsComponent, PaginationComponent, SearchInputComponent, RouterLink, NgIcon, Modal],
  providers: [StaffFacade, provideIcons({ lucidePlus, lucidePencil, lucideTrash2 })],
})
export class Staff implements OnInit {
  readonly facade = inject(StaffFacade);
  readonly staffToDelete = signal<StaffMember | null>(null);

  ngOnInit(): void {
    this.facade.init();
  }

  openDeleteModal(member: StaffMember): void {
    this.staffToDelete.set(member);
  }

  closeDeleteModal(): void {
    if (!this.facade.isSaving()) {
      this.staffToDelete.set(null);
    }
  }

  confirmDelete(): void {
    const member = this.staffToDelete();

    if (!member) {
      return;
    }

    this.facade.removeStaff(member);
    this.staffToDelete.set(null);
  }
}
