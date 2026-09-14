/** Local demo data only. JSON Server does not protect these credentials. */
export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}

export type MockSessionUser = Omit<MockUser, 'password'>;
