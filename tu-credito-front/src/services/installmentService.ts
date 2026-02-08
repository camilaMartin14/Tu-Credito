import api from '../lib/axios';
import { Cuota, CuotaInputDTO } from '../types';

export const getInstallments = async (filters: { 
  estado?: number; 
  mesVto?: number; 
  prestatario?: string;
  idPrestamo?: number;
}): Promise<Cuota[]> => {
  const params = new URLSearchParams();
  if (filters.estado) params.append('estado', filters.estado.toString());
  if (filters.mesVto) params.append('mesVto', filters.mesVto.toString());
  if (filters.prestatario) params.append('prestatario', filters.prestatario);
  if (filters.idPrestamo) params.append('idPrestamo', filters.idPrestamo.toString());

  const response = await api.get(`/installments/filter?${params.toString()}`);
  return response.data;
};

export const getInstallmentById = async (id: number): Promise<Cuota> => {
  const response = await api.get(`/installments/${id}`);
  return response.data;
};

export const addInstallment = async (data: CuotaInputDTO): Promise<void> => {
  await api.post('/installments', data);
};
