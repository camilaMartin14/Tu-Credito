export interface DashboardKpisDTO {
  totalPrestadoHistorico: number;
  capitalPendiente: number;
  totalCobrado: number;
  totalInteresCobrado: number;
  totalEnMora: number;
  porcentajeMorosidad: number;
  rentabilidad: number;
}

export interface GraficoDatoDTO {
  etiqueta: string;
  valor: number;
}

export interface SerieTiempoDTO {
  anio: number;
  mes: number;
  valor: number;
}

// Interfaces deprecated/aliased for compatibility if needed, 
// but preferred to use the generic ones above.
export type PrestamosPorEstadoDTO = GraficoDatoDTO;
export type RankingClientesDeudaDTO = GraficoDatoDTO;
export type FlujoCobranzasDTO = SerieTiempoDTO;
export type EvolucionSaldoDTO = SerieTiempoDTO;

export interface CuotaSimuladaDTO {
  numeroCuota: number;
  monto: number;
  capital: number;
  interes: number;
  fechaVencimiento?: string;
}

export interface SimulacionPrestamoEntryDTO {
  montoPrestamo: number;
  cantidadCuotas: number;
  interesMensual: number;
  fechaInicio?: string;
  redondeoMultiplo?: number;
}

export interface SimulacionPrestamoOutputDTO {
  montoCuota: number;
  totalAPagar: number;
  detalleCuotas: CuotaSimuladaDTO[];
  nuevoTotalAPagar?: number;
  ahorroPorPagoAnticipado?: number;
}
