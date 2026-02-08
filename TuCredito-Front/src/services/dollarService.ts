import api from '../lib/axios';

export const getOfficialDollar = async () => {
  const response = await api.get('/dollar/official/today');
  return response.data;
};
