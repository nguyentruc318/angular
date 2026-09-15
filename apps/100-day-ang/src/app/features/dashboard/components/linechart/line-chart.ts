import { Component, computed, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import type { RevenuePoint } from '../../models/dashboard.model';

@Component({
  selector: 'revenue-line-chart',
  templateUrl: './line-chart.html',
  standalone: true,
  imports: [NgxEchartsDirective],
})
export class RevenueLineChart {
  readonly points = input<RevenuePoint[]>([]);

  readonly chartOptions = computed<EChartsOption>(() => ({
    grid: {
      left: 52,
      right: 24,
      top: 24,
      bottom: 32,
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: unknown) => `£${Number(value).toFixed(2)}`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: this.points().map((point) =>
        new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
        }).format(new Date(`${point.date}T00:00:00`)),
      ),
      axisLine: {
        lineStyle: {
          color: '#cbd5e1',
        },
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: {
        formatter: (value: number) => `£${value}`,
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0',
        },
      },
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: this.points().map((point) => point.revenueMinor / 100),
        lineStyle: {
          color: '#7c3aed',
          width: 3,
        },
        itemStyle: {
          color: '#7c3aed',
        },
        areaStyle: {
          color: 'rgba(124, 58, 237, 0.12)',
        },
      },
    ],
  }));
}
