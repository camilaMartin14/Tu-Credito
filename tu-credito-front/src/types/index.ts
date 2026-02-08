export interface Prestamista {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
}

export interface PrestamistaLoginResponse {
  token: string;
  prestamista: Prestamista;
}

export interface PrestatarioDTO {
  dni: number;
  nombre: string;
  apellido: string;
  telefono: string;
  domicilio: string;
  correo: string;
  esActivo: boolean;
  garanteNombre?: string;
  garanteApellido?: string;
  garanteDni?: string;
  garanteTelefono?: string;
  garanteDomicilio?: string;
  garanteCorreo?: string;
}

export interface CuotaVencerDTO {
  idCuota: number;
  idPrestamo: number;
  nroCuota: number;
  monto: number;
  fechaVencimiento: string;
  nombrePrestatario: string;
  apellidoPrestatario: string;
  dniPrestatario: number;
}

export interface PrestamoDTO {
  idPrestamo?: number;
  dniPrestatario: number;
  nombrePrestatario: string;
  montoOtorgado: number;
  cantidadCtas: number;
  idEstado: number; // 1: Pendiente, 2: Activo, etc.
  fechaOtorgamiento: string;
  fec1erVto: string;
  idSistAmortizacion: number; // 1: Francés, etc.
  tasaInteres: number;
}

export interface PagoInputDTO {
  idCuota: number;
  monto: number;
  fechaPago: string;
  descuento: number;
  recargo: number;
  idMedioPago: number;
}

export interface PagoOutputDTO {
  idPago: number;
  nroCuota: number;
  cantidadTotalCuotas?: number;
  monto: number;
  fecPago: string;
  medioPago: number;
  estado: string;
  nombreCliente?: string;
  apellidoCliente?: string;
  dniCliente?: number;
}

export interface DashboardKpisDTO {
  totalPrestadoHistorico: number;
  capitalPendiente: number;
  totalCobrado: number;
  totalInteresCobrado: number;
  totalEnMora: number;
  porcentajeMorosidad: number;
  rentabilidad: number;
}

export interface SimulacionPrestamoEntryDTO {
  montoPrestamo: number;
  cantidadCuotas: number;
  interesMensual: number; // Tasa
  fechaInicio?: string;
  redondeoMultiplo?: number;
  idSistAmortizacion?: number;
}

export interface CuotaSimuladaDTO {
  numeroCuota: number;
  monto: number;
  capital: number;
  interes: number;
  saldoRestante: number;
  fechaVencimiento: string;
}

export interface SimulacionPrestamoOutputDTO {
  montoCuota: number;
  totalAPagar: number;
  detalleCuotas: CuotaSimuladaDTO[];
  nuevoTotalAPagar?: number;
  ahorroPorPagoAnticipado?: number;
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

// Nuevos tipos agregados
export interface CuotaInputDTO {
  idPrestamo: number;
  monto: number;
  nroCuota: number;
  fecVto: string;
  interes: number;
}

export interface Cuota {
  idCuota: number;
  idPrestamo: number;
  nroCuota: number;
  monto: number;
  fecVto: string;
  idEstado: number;
  interes?: number;
  saldoPendiente?: number;
  idPrestamoNavigation?: {
    dniPrestatarioNavigation?: {
      nombre: string;
      apellido: string;
    }
  }
}

export interface DocumentoDTO {
  idDocumento: number;
  tipoDocumento: string;
  nombreOriginal: string;
  fechaSubida: string;
}

export interface EvaluacionCrediticiaRequestDTO {
  cuit: number;
  montoSolicitado: number;
  cuotaEstimada: number;
  ingresoMensual?: number;
}

export interface EvaluacionCrediticiaResponseDTO {
  estado: string;
  motivo: string;
  montoMaximoSugerido?: number;
  situacionBcra: string;
  detalleRiesgo: string;
}

export interface ResumenPrestamoDTO {
  idPrestamo: number;
  cantidadCuotasOriginales: number;
  cantidadCuotasEfectivas: number;
  mesesActivo: number;
  estadoPrestamo: number;
}

export interface MorosidadDetalleDTO {
  cliente: string;
  fechaVencimiento: string;
  diasAtraso: number;
  montoAdeudado: number;
}

export interface AnalistaTasaDTO {
  tasaPromedioGlobal: number;
  distribucionPorRango: GraficoDatoDTO[];
}

export interface TransactionDTO {
  type: string;
  date: string;
  amount: number;
  entityName: string;
  status: string;
}
