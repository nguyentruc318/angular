import { Component, computed, input, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import type { PopularServicePoint } from '../../models/dashboard.model';

@Component({
  selector: 'popular-services-bar-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './bar-chart.html',
})
export class PopularServicesBarChart {
  readonly data = input<PopularServicePoint[]>([]);
  readonly selectedServiceId = signal<string | null>(null);
  readonly chartOptions = computed<EChartsOption>(() => ({
    grid: {
      left: 120,
      right: 24,
      top: 16,
      bottom: 24,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      valueFormatter: (value: unknown) => `${value} bookings`,
    },
    xAxis: {
      type: 'value',
      min: 0,
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
        },
      },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: this.data().map((service) => service.name),
    },
    series: [
      {
        name: 'Bookings',
        type: 'bar',
        data: this.data().map((service) => service.bookingCount),
        barWidth: 24,
        itemStyle: {
          color: '#7c3aed',
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  }));
}
