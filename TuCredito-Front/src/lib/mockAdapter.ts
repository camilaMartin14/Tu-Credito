import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { 
  PrestatarioDTO, 
  PrestamoDTO, 
  PagoOutputDTO, 
  DashboardKpisDTO,
  CuotaVencerDTO,
  GraficoDatoDTO,
  SerieTiempoDTO,
  TransactionDTO,
  MorosidadDetalleDTO,
  AnalistaTasaDTO
} from '../types';

const SEED_BORROWERS: PrestatarioDTO[] = [
  { dni: 12345678, nombre: 'Juan', apellido: 'Pérez', telefono: '1122334455', domicilio: 'Calle Falsa 123', correo: 'juan@example.com', esActivo: true },
  { dni: 87654321, nombre: 'María', apellido: 'Gómez', telefono: '1199887766', domicilio: 'Av. Siempre Viva 742', correo: 'maria@example.com', esActivo: true },
  { dni: 11223344, nombre: 'Carlos', apellido: 'López', telefono: '1144556677', domicilio: 'San Martín 456', correo: 'carlos@example.com', esActivo: true },
  { dni: 20000001, nombre: 'Ana', apellido: 'Martínez', telefono: '1155667788', domicilio: 'Av. Corrientes 1000', correo: 'ana.martinez@example.com', esActivo: true },
  { dni: 20000002, nombre: 'Pedro', apellido: 'Sánchez', telefono: '1166778899', domicilio: 'Calle Luna 45', correo: 'pedro.sanchez@example.com', esActivo: true },
  { dni: 20000003, nombre: 'Lucía', apellido: 'Fernández', telefono: '1177889900', domicilio: 'Av. Libertador 2500', correo: 'lucia.fernandez@example.com', esActivo: true },
  { dni: 20000004, nombre: 'Miguel', apellido: 'Rodríguez', telefono: '1188990011', domicilio: 'Calle Sol 89', correo: 'miguel.rodriguez@example.com', esActivo: true },
  { dni: 20000005, nombre: 'Sofía', apellido: 'Díaz', telefono: '1199001122', domicilio: 'Av. Cabildo 3000', correo: 'sofia.diaz@example.com', esActivo: true },
  { dni: 30000001, nombre: 'Diego', apellido: 'Torres', telefono: '1112233445', domicilio: 'Calle Real 101', correo: 'diego.torres@example.com', esActivo: true },
  { dni: 30000002, nombre: 'Valentina', apellido: 'Castro', telefono: '1123344556', domicilio: 'Av. La Plata 500', correo: 'valentina.castro@example.com', esActivo: true },
  { dni: 30000003, nombre: 'Mateo', apellido: 'Ruiz', telefono: '1134455667', domicilio: 'Calle Nueva 202', correo: 'mateo.ruiz@example.com', esActivo: true },
  { dni: 30000004, nombre: 'Isabella', apellido: 'Morales', telefono: '1145566778', domicilio: 'Av. Belgrano 1200', correo: 'isabella.morales@example.com', esActivo: true },
  { dni: 30000005, nombre: 'Lucas', apellido: 'Herrera', telefono: '1156677889', domicilio: 'Calle Vieja 303', correo: 'lucas.herrera@example.com', esActivo: true },
  { dni: 30000006, nombre: 'Camila', apellido: 'Flores', telefono: '1167788990', domicilio: 'Av. Santa Fe 2500', correo: 'camila.flores@example.com', esActivo: true },
  { dni: 30000007, nombre: 'Benjamín', apellido: 'Rojas', telefono: '1178899001', domicilio: 'Calle Larga 404', correo: 'benjamin.rojas@example.com', esActivo: true },
  { dni: 30000008, nombre: 'Victoria', apellido: 'Vargas', telefono: '1189900112', domicilio: 'Av. Callao 800', correo: 'victoria.vargas@example.com', esActivo: true },
  { dni: 30000009, nombre: 'Joaquín', apellido: 'Silva', telefono: '1190011223', domicilio: 'Calle Corta 505', correo: 'joaquin.silva@example.com', esActivo: true },
  { dni: 30000010, nombre: 'Martina', apellido: 'Ortiz', telefono: '1101122334', domicilio: 'Av. 9 de Julio 1000', correo: 'martina.ortiz@example.com', esActivo: true },
];

const SEED_LOANS: PrestamoDTO[] = [
  { 
    idPrestamo: 101, 
    dniPrestatario: 12345678, 
    nombrePrestatario: 'Juan Pérez', 
    montoOtorgado: 50000, 
    cantidadCtas: 12, 
    idEstado: 1, 
    fechaOtorgamiento: new Date().toISOString(), 
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.5
  },
  { 
    idPrestamo: 102, 
    dniPrestatario: 87654321, 
    nombrePrestatario: 'María Gómez', 
    montoOtorgado: 100000, 
    cantidadCtas: 24, 
    idEstado: 1, 
    fechaOtorgamiento: new Date().toISOString(), 
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 6.0
  },
  {
    idPrestamo: 103,
    dniPrestatario: 20000001,
    nombrePrestatario: 'Ana Martínez',
    montoOtorgado: 75000,
    cantidadCtas: 18,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.8
  },
  {
    idPrestamo: 104,
    dniPrestatario: 20000002,
    nombrePrestatario: 'Pedro Sánchez',
    montoOtorgado: 30000,
    cantidadCtas: 6,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.0
  },
  {
    idPrestamo: 105,
    dniPrestatario: 20000003,
    nombrePrestatario: 'Lucía Fernández',
    montoOtorgado: 150000,
    cantidadCtas: 36,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 6.5
  },
  {
    idPrestamo: 106,
    dniPrestatario: 20000004,
    nombrePrestatario: 'Miguel Rodríguez',
    montoOtorgado: 200000,
    cantidadCtas: 24,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 7.0
  },
  {
    idPrestamo: 200,
    dniPrestatario: 30000001,
    nombrePrestatario: 'Diego Torres',
    montoOtorgado: 80000,
    cantidadCtas: 12,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.5
  },
  {
    idPrestamo: 201,
    dniPrestatario: 30000002,
    nombrePrestatario: 'Valentina Castro',
    montoOtorgado: 120000,
    cantidadCtas: 24,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 6.2
  },
  {
    idPrestamo: 202,
    dniPrestatario: 30000003,
    nombrePrestatario: 'Mateo Ruiz',
    montoOtorgado: 45000,
    cantidadCtas: 6,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 4.8
  },
  {
    idPrestamo: 203,
    dniPrestatario: 30000004,
    nombrePrestatario: 'Isabella Morales',
    montoOtorgado: 250000,
    cantidadCtas: 36,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 7.5
  },
  {
    idPrestamo: 204,
    dniPrestatario: 30000005,
    nombrePrestatario: 'Lucas Herrera',
    montoOtorgado: 60000,
    cantidadCtas: 12,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.2
  },
  {
    idPrestamo: 205,
    dniPrestatario: 30000006,
    nombrePrestatario: 'Camila Flores',
    montoOtorgado: 180000,
    cantidadCtas: 24,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 6.8
  },
  {
    idPrestamo: 206,
    dniPrestatario: 30000007,
    nombrePrestatario: 'Benjamín Rojas',
    montoOtorgado: 95000,
    cantidadCtas: 18,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.9
  },
  {
    idPrestamo: 207,
    dniPrestatario: 30000008,
    nombrePrestatario: 'Victoria Vargas',
    montoOtorgado: 35000,
    cantidadCtas: 6,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 4.5
  },
  {
    idPrestamo: 208,
    dniPrestatario: 30000009,
    nombrePrestatario: 'Joaquín Silva',
    montoOtorgado: 300000,
    cantidadCtas: 48,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 8.0
  },
  {
    idPrestamo: 209,
    dniPrestatario: 30000010,
    nombrePrestatario: 'Martina Ortiz',
    montoOtorgado: 55000,
    cantidadCtas: 12,
    idEstado: 1,
    fechaOtorgamiento: new Date().toISOString(),
    fec1erVto: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    idSistAmortizacion: 1,
    tasaInteres: 5.1
  }
];

const SEED_PAYMENTS: PagoOutputDTO[] = [
  {
    idPago: 1,
    nroCuota: 1,
    monto: 5000,
    fecPago: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Juan',
    apellidoCliente: 'Pérez',
    dniCliente: 12345678
  },
  {
    idPago: 2,
    nroCuota: 1,
    monto: 4500,
    fecPago: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Ana',
    apellidoCliente: 'Martínez',
    dniCliente: 20000001
  },
  {
    idPago: 3,
    nroCuota: 2,
    monto: 5000,
    fecPago: new Date().toISOString(),
    medioPago: 2,
    estado: 'Aprobado',
    nombreCliente: 'Juan',
    apellidoCliente: 'Pérez',
    dniCliente: 12345678
  },
  {
    idPago: 100,
    nroCuota: 1,
    monto: 7000,
    fecPago: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Diego',
    apellidoCliente: 'Torres',
    dniCliente: 30000001
  },
  {
    idPago: 101,
    nroCuota: 2,
    monto: 7000,
    fecPago: new Date().toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Diego',
    apellidoCliente: 'Torres',
    dniCliente: 30000001
  },
  {
    idPago: 102,
    nroCuota: 1,
    monto: 5500,
    fecPago: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 2,
    estado: 'Aprobado',
    nombreCliente: 'Valentina',
    apellidoCliente: 'Castro',
    dniCliente: 30000002
  },
  {
    idPago: 103,
    nroCuota: 1,
    monto: 8000,
    fecPago: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Mateo',
    apellidoCliente: 'Ruiz',
    dniCliente: 30000003
  },
  {
    idPago: 104,
    nroCuota: 1,
    monto: 7500,
    fecPago: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Isabella',
    apellidoCliente: 'Morales',
    dniCliente: 30000004
  },
  {
    idPago: 105,
    nroCuota: 1,
    monto: 5200,
    fecPago: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 2,
    estado: 'Aprobado',
    nombreCliente: 'Lucas',
    apellidoCliente: 'Herrera',
    dniCliente: 30000005
  },
  {
    idPago: 106,
    nroCuota: 2,
    monto: 5200,
    fecPago: new Date().toISOString(),
    medioPago: 2,
    estado: 'Aprobado',
    nombreCliente: 'Lucas',
    apellidoCliente: 'Herrera',
    dniCliente: 30000005
  },
  {
    idPago: 107,
    nroCuota: 1,
    monto: 9000,
    fecPago: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Camila',
    apellidoCliente: 'Flores',
    dniCliente: 30000006
  },
  {
    idPago: 108,
    nroCuota: 2,
    monto: 9000,
    fecPago: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Camila',
    apellidoCliente: 'Flores',
    dniCliente: 30000006
  },
  {
    idPago: 109,
    nroCuota: 1,
    monto: 6000,
    fecPago: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 2,
    estado: 'Aprobado',
    nombreCliente: 'Benjamín',
    apellidoCliente: 'Rojas',
    dniCliente: 30000007
  },
  {
    idPago: 110,
    nroCuota: 1,
    monto: 4000,
    fecPago: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Victoria',
    apellidoCliente: 'Vargas',
    dniCliente: 30000008
  },
  {
    idPago: 111,
    nroCuota: 1,
    monto: 11000,
    fecPago: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    medioPago: 1,
    estado: 'Aprobado',
    nombreCliente: 'Joaquín',
    apellidoCliente: 'Silva',
    dniCliente: 30000009
  }
];

// --- HELPERS ---
const getStorage = <T>(key: string, seed: T): T => {
  const stored = localStorage.getItem(`demo_${key}`);
  if (!stored) {
    localStorage.setItem(`demo_${key}`, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
};

const setStorage = <T>(key: string, data: T) => {
  localStorage.setItem(`demo_${key}`, JSON.stringify(data));
};

// --- ADAPTER ---
export const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { url, method, data: requestData, params } = config;
      const parsedData = requestData ? JSON.parse(requestData) : null;
      let responseData: any = null;
      let status = 200;

      try {
        const borrowers = getStorage<PrestatarioDTO[]>('borrowers', SEED_BORROWERS);
        const loans = getStorage<PrestamoDTO[]>('loans', SEED_LOANS);
        const payments = getStorage<PagoOutputDTO[]>('payments', SEED_PAYMENTS);

        // --- DASHBOARD ROUTES ---
        if (url?.includes('/dashboard/kpis') && method === 'get') {
          const totalPrestado = loans.reduce((acc, l) => acc + l.montoOtorgado, 0);
          const kpis: DashboardKpisDTO = {
            totalPrestadoHistorico: totalPrestado,
            capitalPendiente: totalPrestado * 0.7,
            totalCobrado: totalPrestado * 0.3,
            totalInteresCobrado: totalPrestado * 0.05,
            totalEnMora: 0,
            porcentajeMorosidad: 0,
            rentabilidad: 15
          };
          responseData = kpis;
        }
        else if (url?.includes('/dashboard/upcoming-installments') && method === 'get') {
           const upcoming: CuotaVencerDTO[] = [
             { idCuota: 1, idPrestamo: 101, nroCuota: 1, monto: 4500, fechaVencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), nombrePrestatario: 'Juan', apellidoPrestatario: 'Pérez', dniPrestatario: 12345678 },
             { idCuota: 2, idPrestamo: 102, nroCuota: 1, monto: 5500, fechaVencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), nombrePrestatario: 'María', apellidoPrestatario: 'Gómez', dniPrestatario: 87654321 },
             { idCuota: 3, idPrestamo: 103, nroCuota: 1, monto: 3200, fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), nombrePrestatario: 'Ana', apellidoPrestatario: 'Martínez', dniPrestatario: 20000001 },
             { idCuota: 4, idPrestamo: 104, nroCuota: 1, monto: 2100, fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), nombrePrestatario: 'Pedro', apellidoPrestatario: 'Sánchez', dniPrestatario: 20000002 },
             { idCuota: 5, idPrestamo: 105, nroCuota: 1, monto: 6800, fechaVencimiento: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), nombrePrestatario: 'Lucía', apellidoPrestatario: 'Fernández', dniPrestatario: 20000003 }
           ];
           responseData = upcoming;
        }
        else if (url?.includes('/dashboard/recent-transactions') && method === 'get') {
           const transactions: TransactionDTO[] = [
             { type: 'payment', date: new Date().toISOString(), amount: 7000, entityName: 'Diego Torres', status: 'completed' },
             { type: 'payment', date: new Date().toISOString(), amount: 5200, entityName: 'Lucas Herrera', status: 'completed' },
             { type: 'loan', date: new Date().toISOString(), amount: 80000, entityName: 'Diego Torres', status: 'completed' },
             { type: 'payment', date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), amount: 4500, entityName: 'Ana Martínez', status: 'completed' },
             { type: 'loan', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), amount: 75000, entityName: 'Ana Martínez', status: 'completed' },
             { type: 'loan', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), amount: 30000, entityName: 'Pedro Sánchez', status: 'completed' },
             { type: 'payment', date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), amount: 9000, entityName: 'Camila Flores', status: 'completed' }
           ];
           responseData = transactions;
        }
        else if (url?.includes('/dashboard') && method === 'get') {
          // Generic empty/mock response for other dashboard widgets to prevent crashes
          if (url.includes('cash-flow')) responseData = [];
          else if (url.includes('loans-trend')) responseData = [];
          else if (url.includes('risk-composition')) responseData = [];
          else if (url.includes('loans-by-status')) responseData = [ { etiqueta: 'Al día', valor: 100 } ];
          else if (url.includes('monthly-collections')) responseData = [];
          else if (url.includes('delinquency')) responseData = [];
          else if (url.includes('customer-ranking')) responseData = [];
          else if (url.includes('rate-analysis')) responseData = { tasaPromedioGlobal: 5, distribucionPorRango: [] };
          else if (url.includes('balance-evolution')) responseData = [];
          else responseData = [];
        }

        // --- BORROWERS ROUTES ---
        else if (url?.endsWith('/borrowers') && method === 'get') {
          responseData = borrowers;
        }
        else if (url?.endsWith('/borrowers') && method === 'post') {
          const newBorrower = { ...parsedData, esActivo: true };
          if (borrowers.find(b => b.dni === newBorrower.dni)) {
             throw new Error('Ya existe un cliente con ese DNI');
          }
          borrowers.push(newBorrower);
          setStorage('borrowers', borrowers);
          responseData = newBorrower;
        }
        else if (url?.match(/\/borrowers\/\d+$/) && method === 'get') {
          const dni = parseInt(url.split('/').pop() || '0');
          const borrower = borrowers.find(b => b.dni === dni);
          if (!borrower) throw new Error('Cliente no encontrado');
          responseData = borrower;
        }
        else if (url?.match(/\/borrowers\/\d+$/) && method === 'put') {
          const dni = parseInt(url.split('/').pop() || '0');
          const index = borrowers.findIndex(b => b.dni === dni);
          if (index !== -1) {
            borrowers[index] = { ...borrowers[index], ...parsedData };
            setStorage('borrowers', borrowers);
            responseData = borrowers[index];
          }
        }
        else if (url?.match(/\/borrowers\/\d+\/status/) && method === 'patch') {
           // Toggle status logic
           responseData = {};
        }

        // --- LOANS ROUTES ---
        else if (url?.endsWith('/loans') && method === 'get') {
          responseData = loans;
        }
        else if (url?.endsWith('/loans') && method === 'post') {
           const newLoan = { 
               ...parsedData, 
               idPrestamo: Math.floor(Math.random() * 10000) + 100,
               fechaOtorgamiento: new Date().toISOString(),
               idEstado: 1 
           };
           loans.unshift(newLoan);
           setStorage('loans', loans);
           responseData = newLoan;
        }

        // --- PAYMENTS ROUTES ---
        else if (url?.endsWith('/payments') && method === 'get') {
           responseData = payments;
        }
        else if (url?.endsWith('/payments') && method === 'post') {
           const newPayment = {
               ...parsedData,
               idPago: Math.floor(Math.random() * 10000) + 100,
               fecPago: new Date().toISOString(),
               estado: 'Aprobado'
           };
           payments.unshift(newPayment);
           setStorage('payments', payments);
           responseData = newPayment;
        }
        
        // --- FALLBACK ---
        else {
           // For any other unknown request in demo mode, return null or empty array
           // to avoid breaking the app completely.
           console.warn(`MockAdapter: Unhandled URL ${url} [${method}]`);
           responseData = [];
        }

        resolve({
          data: responseData,
          status: status,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });

      } catch (e: any) {
        console.error('Mock Error:', e);
        reject({
           response: {
             status: 400,
             data: { message: e.message || 'Error processing request' }
           }
        });
      }
    }, 600); // Simulate network delay
  });
};
