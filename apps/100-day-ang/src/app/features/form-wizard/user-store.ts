import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { StaffService } from '../staff/services/staff.service';
import { StaffMember } from '../staff/models/staff.model';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
type UserListState = {
  loading: boolean;
  error: string | null;
  search: string;
};

export const userStore = signalStore(
  { providedIn: 'root' },
  withState<UserListState>({ loading: false, error: null, search: '' }),
  withEntities<StaffMember>(),
  withProps(() => ({
    staffService: inject(StaffService),
  })),
  withMethods((store) => ({
    loadStaff: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            loading: true,
            error: null,
          });
        }),
        switchMap(() =>
          store.staffService.list({ page: 1, limit: 100 }).pipe(
            tapResponse({
              next: ({ data }) => {
                patchState(store, setAllEntities(data));
              },
              error: () => {
                patchState(store, {
                  error: 'Không thể tải danh sách nhân viên.',
                });
              },
              finalize: () => {
                patchState(store, {
                  loading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),
  })),
);
