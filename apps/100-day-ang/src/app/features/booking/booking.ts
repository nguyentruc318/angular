import { Component, inject, OnInit } from '@angular/core';
import { PaginationComponent } from '../../shared/components/pagination/pagination';
import { SearchInputComponent } from '../../shared/components/search/search';
import { SelectComponent } from '../../shared/components/select/select';
import { BookingFacade } from './booking.facade';
import { TabsComponent, DateFilterComponent } from 'shared';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-booking',
  templateUrl: './booking.html',
  imports: [
    PaginationComponent,
    SearchInputComponent,
    DatePipe,

    DateFilterComponent,
    SelectComponent,
    TabsComponent,
  ],
  providers: [BookingFacade],
})
export class Booking implements OnInit {
  readonly facade = inject(BookingFacade);

  ngOnInit(): void {
    this.facade.init();
  }
}
