export interface PrestamoDTO {
  dniPrestatario: number;
  nombrePrestatario: string;
  montoOtorgado: number;
  cantidadCtas: number;
  idEstado: number;
  fechaOtorgamiento: string;
  fec1erVto: string;
  idSistAmortizacion: number;
  tasaInteres: number;
}

export interface ResumenPrestamoDTO {
  idPrestamo: number;
  cantidadCuotasOriginales: number;
  cantidadCuotasEfectivas: number;
  mesesActivo: number;
  estadoPrestamo: number;
}
