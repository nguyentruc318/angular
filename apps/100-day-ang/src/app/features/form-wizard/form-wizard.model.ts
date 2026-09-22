// form-wizard.model.ts
export interface BasicInfor {
  name: string;
  email: string;
  phone: string;
  dob: Date | null;
  gender: string | null;
}

export interface WorkInfor {
  department: string;
  role: string;
  job: string;
  manager: string;
}

export interface AccessSettings {
  status: string;
  sendInvite: boolean;
  notes: string;
}

export interface FormWizardDraft {
  basicInfo: BasicInfor;
  workInfo: WorkInfor[];
  accessSettings: AccessSettings;
}

export interface FormWizardState {
  currentStep: number;
  isComplete: boolean;
  loading: boolean;
  error: string | null;
  draft: FormWizardDraft;
}
