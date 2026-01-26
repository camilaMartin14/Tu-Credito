export interface PrestamistaLoginDTO {
  usuario: string;
  contrasenia: string;
}

export interface PrestamistaRegisterDTO {
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
  contrasenia: string;
}

export interface PrestamistaUpdateDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  usuario?: string;
  contraseniaActual?: string;
  nuevaContrasenia?: string;
}

export interface Prestamista {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
  esActivo: boolean;
}

export interface AuthResponse {
  token: string;
  prestamista: Prestamista;
}
