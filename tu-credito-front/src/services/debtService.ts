import api from '../lib/axios';

export const getDebtsByCuit = async (cuit: number): Promise<any> => {
  const response = await api.get(`/debts/${cuit}`);
  return response.data;
};
