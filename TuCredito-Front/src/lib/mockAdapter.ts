import { AxiosRequestConfig, AxiosResponse } from 'axios';
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

// --- SEED DATA ---
const SEED_BORROWERS: PrestatarioDTO[] = [
  { dni: 12345678, nombre: 'Juan', apellido: 'Pérez', telefono: '1122334455', domicilio: 'Calle Falsa 123', correo: 'juan@example.com', esActivo: true },
  { dni: 87654321, nombre: 'María', apellido: 'Gómez', telefono: '1199887766', domicilio: 'Av. Siempre Viva 742', correo: 'maria@example.com', esActivo: true },
  { dni: 11223344, nombre: 'Carlos', apellido: 'López', telefono: '1144556677', domicilio: 'San Martín 456', correo: 'carlos@example.com', esActivo: true },
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
export const mockAdapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
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
             { idCuota: 2, idPrestamo: 102, nroCuota: 1, monto: 5500, fechaVencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), nombrePrestatario: 'María', apellidoPrestatario: 'Gómez', dniPrestatario: 87654321 }
           ];
           responseData = upcoming;
        }
        else if (url?.includes('/dashboard/recent-transactions') && method === 'get') {
           const transactions: TransactionDTO[] = [
             { type: 'payment', date: new Date().toISOString(), amount: 5000, entityName: 'Juan Pérez', status: 'completed' },
             { type: 'loan', date: new Date().toISOString(), amount: 50000, entityName: 'Juan Pérez', status: 'completed' }
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
