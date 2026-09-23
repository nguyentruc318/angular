import { signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { Staff } from '../staff/staff';
import { inject } from '@angular/core';
import { StaffService } from '../staff/services/staff.service';

type UserListState = {
  loading: boolean;
  error: string | null;
  search: string;
};

export const userStore = signalStore(
  { providedIn: 'root' },
  withState<UserListState>({ loading: false, error: null, search: '' }),
  withEntities<Staff>(),
  withProps(() => ({
    staffService: inject(StaffService),
  })),
  withMethods((store) => ({})),
);
