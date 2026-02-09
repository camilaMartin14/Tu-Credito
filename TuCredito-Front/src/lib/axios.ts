import axios from 'axios';

// En desarrollo, usamos dinámicamente el hostname actual (localhost o IP de red)
// para que funcione tanto en PC como en dispositivos móviles conectados a la misma red.
const isDev = import.meta.env.DEV;
const hostname = window.location.hostname;
// Puerto por defecto de tu backend .NET
const apiPort = '5134'; 

// URL de producción en Render
const PROD_API_URL = 'https://tu-credito-api.onrender.com/api';

const baseURL = isDev 
  ? `http://${hostname}:${apiPort}/api` 
  : (import.meta.env.VITE_API_URL || PROD_API_URL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('prestamista');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
