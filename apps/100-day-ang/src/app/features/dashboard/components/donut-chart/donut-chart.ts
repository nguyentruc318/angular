import { Component, computed, input, output, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import type { BookingStatusPoint } from '../../models/dashboard.model';

@Component({
  selector: 'booking-status-donut',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './donut-chart.html',
})
export class BookingStatusDonut {
  readonly data = input<BookingStatusPoint[]>([]);
  readonly selectedStatus = signal<string | null>(null);
  readonly statusSelected = output<string | null>();
  onChartClick(event: { name?: string }): void {
    const status = event.name ?? null;

    this.selectedStatus.update((current) => (current === status ? null : status));

    this.statusSelected.emit(this.selectedStatus());
  }
  readonly chartOptions = computed<EChartsOption>(() => ({
    tooltip: {
      trigger: 'item',
      valueFormatter: (value: unknown) => `${value} bookings`,
    },
    legend: {
      bottom: 0,
    },
    series: [
      {
        name: 'Booking status',
        type: 'pie',
        emphasis: {
          scale: true,
          scaleSize: 8,
        },
        selectedMode: 'single',
        blur: {
          itemStyle: {
            opacity: 0.35,
          },
        },
        select: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0, 0, 0, 0.25)',
          },
        },
        radius: ['55%', '78%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 3,
        },
        label: {
          show: false,
        },
        data: this.data().map((item) => ({
          name: item.label ?? item.status,
          value: item.count,
          selected: this.selectedStatus() === (item.label ?? item.status),
        })),
      },
    ],
  }));
}
