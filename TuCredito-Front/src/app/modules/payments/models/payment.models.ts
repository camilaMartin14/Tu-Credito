export interface PagoOutputDTO {
  idPago: number;
  nroCuota: number;
  monto: number;
  fecPago: string;
  medioPago: number;
  estado: string;
}

export interface PagoInputDTO {
  idCuota: number;
  monto: number;
  idMedioPago: number;
  observaciones?: string;
  fecPago: string;
}
