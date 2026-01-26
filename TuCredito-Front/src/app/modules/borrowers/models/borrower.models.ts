export interface PrestatarioDTO {
  dni?: number;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  domicilio?: string;
  correo?: string;
  esActivo?: boolean;
  garanteNombre?: string;
  garanteApellido?: string;
  garanteTelefono?: string;
  garanteDomicilio?: string;
  garanteCorreo?: string;
}

export interface Garante {
    id: number;
    nombre: string;
    apellido: string;
    dni: number;
    telefono: string;
    domicilio: string;
    correo: string;
}

export interface Prestatario {
    dni: number;
    nombre: string;
    apellido: string;
    telefono: string;
    domicilio: string;
    correo: string;
    esActivo: boolean;
    idGarante?: number;
    idGaranteNavigation?: Garante;
}
