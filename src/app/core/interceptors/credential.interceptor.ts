import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const isBackendRequest = req.url.startsWith(environment.apiBaseUrl);

  if (!isBackendRequest) {
    return next(req);
  }

  return next(
    req.clone({
      withCredentials: true,
    }),
  );
};
