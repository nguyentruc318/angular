import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class QueryParamsService {
  private readonly router = inject(Router);

  merge(route: ActivatedRoute, queryParams: Params): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
