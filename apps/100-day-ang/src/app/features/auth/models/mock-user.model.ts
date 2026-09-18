import { UserRole } from './auth.model';

/** Local demo data only. JSON Server does not protect these credentials. */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: UserRole;
}

export type MockSessionUser = Omit<MockUser, 'password'>;
