import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';

import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchInputComponent } from '../../shared/components/search/search';
import { ServiceFacade } from './service.facade';
import { Modal } from 'shared';
import { ManagementService } from './models/services.model';
@Component({
  selector: 'app-services',
  templateUrl: './services.html',
  imports: [PaginationComponent, SearchInputComponent, RouterLink, Modal, NgIcon],
  providers: [ServiceFacade, provideIcons({ lucidePlus, lucidePencil, lucideTrash2 })],
})
export class Services implements OnInit {
  readonly facade = inject(ServiceFacade);
  readonly services = this.facade.services;
  readonly pagination = this.facade.pagination;
  readonly isLoading = this.facade.isLoading;
  readonly errorMessage = this.facade.errorMessage;
  readonly search = this.facade.search;
  readonly isArchiveModalOpen = signal(false);
  readonly serviceToArchive = signal<ManagementService | null>(null);
  ngOnInit(): void {
    this.facade.init();
  }

  onSearchChange(search: string): void {
    this.facade.updateSearch(search);
  }

  changePage(page: number): void {
    this.facade.changePage(page);
  }
  openArchiveModal(service: ManagementService): void {
    this.serviceToArchive.set(service);
    this.isArchiveModalOpen.set(true);
  }

  closeArchiveModal(): void {
    this.isArchiveModalOpen.set(false);
    this.serviceToArchive.set(null);
  }
  confirmArchive(): void {
    const service = this.serviceToArchive();

    if (!service) {
      return;
    }

    this.facade.archive(service);
    this.closeArchiveModal();
  }
}

