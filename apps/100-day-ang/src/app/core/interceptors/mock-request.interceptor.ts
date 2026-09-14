import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const mockRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const isMockRequest = req.url.startsWith(`${environment.mockApiBaseUrl}/`);

  if (!environment.useMockAuth || !isMockRequest) {
    return next(req);
  }

 
  const modifiedReq = req.clone({
    setHeaders: { 'X-App-Name': 'angular-admin' },
  });

  
  const label = `[Mock API] ${req.method} ${new URL(req.url).pathname}`;
  console.log(label, 'Sending');

 
  return next(modifiedReq).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log(label, 'Response', event.status);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.warn(label, 'Error', error.status);
      },
    }),
  );
};
