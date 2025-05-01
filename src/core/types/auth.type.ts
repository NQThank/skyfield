export interface LoginPayload {
  email: string;
  password: string;
}

export interface SessionUser {
  duration: number;
  token: string;
}

export type AuthSlice = {
  user: SessionUser | null;
  loading: boolean;
  isCollapsed: boolean;
};
