import api from '../lib/axios';
import { 
  DashboardKpisDTO, 
  GraficoDatoDTO, 
  SerieTiempoDTO, 
  CuotaVencerDTO,
  MorosidadDetalleDTO,
  AnalistaTasaDTO,
  TransactionDTO
} from '../types';

export const getDashboardKpis = async (): Promise<DashboardKpisDTO> => {
  const response = await api.get('/dashboard/kpis');
  return response.data;
};

export const getCashFlowProjection = async (): Promise<GraficoDatoDTO[]> => {
  const response = await api.get('/dashboard/cash-flow-projection');
  return response.data;
};

export const getLoansTrend = async (): Promise<SerieTiempoDTO[]> => {
  const response = await api.get('/dashboard/loans-trend');
  return response.data;
};

export const getRiskComposition = async (): Promise<GraficoDatoDTO[]> => {
  const response = await api.get('/dashboard/risk-composition');
  return response.data;
};

export const getLoansByStatus = async (): Promise<GraficoDatoDTO[]> => {
  const response = await api.get('/dashboard/loans-by-status');
  return response.data;
};

export const getMonthlyCollections = async (): Promise<SerieTiempoDTO[]> => {
  const response = await api.get('/dashboard/monthly-collections');
  return response.data;
};

export const getUpcomingInstallments = async (): Promise<CuotaVencerDTO[]> => {
  const response = await api.get('/dashboard/upcoming-installments');
  return response.data;
};

export const getRecentTransactions = async (): Promise<TransactionDTO[]> => {
  const response = await api.get('/dashboard/recent-transactions');
  return response.data;
};

export const getDelinquencyDetails = async (): Promise<MorosidadDetalleDTO[]> => {
  const response = await api.get('/dashboard/delinquency');
  return response.data;
};

export const getCustomerRanking = async (): Promise<GraficoDatoDTO[]> => {
  const response = await api.get('/dashboard/customer-ranking');
  return response.data;
};

export const getRateAnalysis = async (): Promise<AnalistaTasaDTO> => {
  const response = await api.get('/dashboard/rate-analysis');
  return response.data;
};

export const getBalanceEvolution = async (): Promise<SerieTiempoDTO[]> => {
  const response = await api.get('/dashboard/balance-evolution');
  return response.data;
};
