import api from '../lib/axios';
import { EvaluacionCrediticiaRequestDTO, EvaluacionCrediticiaResponseDTO } from '../types';

export const evaluateRisk = async (data: EvaluacionCrediticiaRequestDTO): Promise<EvaluacionCrediticiaResponseDTO> => {
  const response = await api.post('/credit-evaluation', data);
  return response.data;
};
