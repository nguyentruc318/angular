import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';

import { LineChart, BarChart, PieChart } from 'echarts/charts';

import { LegendComponent } from 'echarts/components';
import { GridComponent, TooltipComponent } from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

import { routes } from './app.routes';
import { mockRequestInterceptor } from './core/interceptors/mock-request.interceptor';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockRequestInterceptor])),
    provideEchartsCore({ echarts }),
  ],
};
