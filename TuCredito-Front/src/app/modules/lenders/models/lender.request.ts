export interface LoginLenderRequest {
  email: string;
  password: string;
}

export interface RegisterLenderRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateLenderRequest {
  name?: string;
  email?: string;
}

export interface Lender {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
}