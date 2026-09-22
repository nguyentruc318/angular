import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AccessSettings, BasicInfor, FormWizardState, WorkInfor } from './form-wizard.model';

const initialState: FormWizardState = {
  currentStep: 0,
  isComplete: false,
  loading: false,
  error: null,
  draft: {
    basicInfo: { name: '', email: '', phone: '', dob: null, gender: null },
    workInfo: [{ department: '', role: '', job: '', manager: '' }],
    accessSettings: { status: 'active', sendInvite: true, notes: '' },
  },
};

export const formWizardStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setBasicInfo(basicInfo: BasicInfor): void {
      patchState(store, ({ draft }) => ({
        draft: {
          ...draft,
          basicInfo,
        },
      }));
    },

    setWorkInfo(workInfo: WorkInfor[]): void {
      patchState(store, ({ draft }) => ({
        draft: {
          ...draft,
          workInfo,
        },
      }));
    },

    setAccessSettings(accessSettings: AccessSettings): void {
      patchState(store, ({ draft }) => ({
        draft: {
          ...draft,
          accessSettings,
        },
      }));
    },
    setStep(step: number): void {
      patchState(store, { currentStep: step });
    },
    setError(error: string | null): void {
      patchState(store, { error });
    },
    setComplete(isComplete: boolean): void {
      patchState(store, { isComplete });
    },
    reset(): void {
      patchState(store, initialState);
    },
  })),
);
