import api from '../lib/axios';
import { PagoInputDTO, PagoOutputDTO } from '../types';

export const getPayments = async (): Promise<PagoOutputDTO[]> => {
  const response = await api.get('/payments'); // Ajustar endpoint si es necesario (el controller se llama PagoController)
  return response.data;
};

export const createPayment = async (data: PagoInputDTO): Promise<any> => {
  const response = await api.post('/payments', data);
  return response.data;
};

export const getPaymentById = async (id: number): Promise<PagoOutputDTO> => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const getPaymentsByFilter = async (filters: { nombre?: string; mes?: number }): Promise<PagoOutputDTO[]> => {
  const params = new URLSearchParams();
  if (filters.nombre) params.append('nombre', filters.nombre);
  if (filters.mes) params.append('mes', filters.mes.toString());
  const response = await api.get(`/payments/filter?${params.toString()}`);
  return response.data;
};

export const updatePaymentStatus = async (id: number, estado: string): Promise<void> => {
  await api.put(`/payments/${id}/status`, JSON.stringify(estado), {
    headers: { 'Content-Type': 'application/json' }
  });
};
