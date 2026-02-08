import api from '../lib/axios';
import { SimulacionPrestamoEntryDTO, SimulacionPrestamoOutputDTO, PrestamoDTO, ResumenPrestamoDTO } from '../types';

export const simulateLoan = async (data: SimulacionPrestamoEntryDTO): Promise<SimulacionPrestamoOutputDTO> => {
  const response = await api.post('/calculator/simulate', data);
  return response.data;
};

export const createLoan = async (data: PrestamoDTO) => {
  const response = await api.post('/loans', data);
  return response.data;
};

export const getLoans = async (): Promise<PrestamoDTO[]> => {
  const response = await api.get('/loans');
  return response.data;
};

export const getLoanById = async (id: number): Promise<PrestamoDTO> => {
  const response = await api.get(`/loans/${id}`);
  return response.data;
};

export const getLoansByFilter = async (filters: { 
  nombre?: string; 
  estado?: number; 
  mesVto?: number; 
  anio?: number 
}): Promise<PrestamoDTO[]> => {
  const params = new URLSearchParams();
  if (filters.nombre) params.append('nombre', filters.nombre);
  if (filters.estado) params.append('estado', filters.estado.toString());
  if (filters.mesVto) params.append('mesVto', filters.mesVto.toString());
  if (filters.anio) params.append('anio', filters.anio.toString());

  const response = await api.get(`/loans/filter?${params.toString()}`);
  return response.data;
};

export const getLoanSummary = async (id: number): Promise<ResumenPrestamoDTO> => {
  const response = await api.get(`/loans/${id}/summary`);
  return response.data;
};

export const archiveLoan = async (id: number): Promise<void> => {
  await api.put(`/loans/${id}/archive`);
};

export const deleteLoan = async (id: number): Promise<void> => {
  await api.delete(`/loans/${id}`);
};
