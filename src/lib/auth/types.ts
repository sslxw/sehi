export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
}

export interface StoredUser extends AuthUser {
  passwordHash: string;
}
