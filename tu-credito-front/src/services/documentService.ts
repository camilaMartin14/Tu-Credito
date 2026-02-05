import api from '../lib/axios';
import { DocumentoDTO } from '../types';

export const getDocuments = async (entidadTipo: string, entidadId: number): Promise<DocumentoDTO[]> => {
  const response = await api.get(`/documents?entidadTipo=${entidadTipo}&entidadId=${entidadId}`);
  return response.data;
};

export const uploadDocument = async (formData: FormData): Promise<void> => {
  await api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const downloadDocument = async (id: number, nombre: string): Promise<void> => {
  const response = await api.get(`/documents/${id}/download`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nombre);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
