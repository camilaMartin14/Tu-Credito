import api from '../lib/axios';
import { PrestatarioDTO } from '../types';

export const getBorrowers = async (filters?: Partial<PrestatarioDTO>): Promise<PrestatarioDTO[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
  }
  const response = await api.get(`/borrowers?${params.toString()}`);
  return response.data;
};

export const createBorrower = async (data: PrestatarioDTO): Promise<PrestatarioDTO> => {
  const response = await api.post('/borrowers', data);
  return response.data;
};

export const getBorrowerByDni = async (dni: number): Promise<PrestatarioDTO> => {
  const response = await api.get(`/borrowers/${dni}`);
  return response.data;
};

export const updateBorrower = async (dni: number, data: PrestatarioDTO): Promise<void> => {
  await api.put(`/borrowers/${dni}`, data);
};

export const toggleBorrowerStatus = async (dni: number, activo: boolean): Promise<void> => {
  await api.patch(`/borrowers/${dni}/status?activo=${activo}`);
};
