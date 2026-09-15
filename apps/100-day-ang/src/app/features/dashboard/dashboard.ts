import { Component, inject, OnInit } from '@angular/core';

import { DateRangePickerComponent, TabOption, TabsComponent } from 'shared';
import { PopularServicesBarChart } from './components/barchart/barchart';
import { RevenueLineChart } from './components/linechart/line-chart';
import { DashboardFacade } from './dashboard.facade';
import { BookingStatusDonut } from './components/donut-chart/donut-chart';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [
    RevenueLineChart,
    BookingStatusDonut,
    PopularServicesBarChart,
    TabsComponent,
    DateRangePickerComponent,
  ],
  providers: [DashboardFacade],
})
export class Dashboard implements OnInit {
  readonly facade = inject(DashboardFacade);

  readonly rangeTabs: readonly TabOption[] = [
    { value: '7', label: '7 days' },
    { value: '14', label: '14 days' },
    { value: '30', label: '30 days' },
    { value: 'custom', label: 'Custom range' },
  ];

  ngOnInit(): void {
    this.facade.load();
  }
}
