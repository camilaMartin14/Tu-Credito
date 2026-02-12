import axios from 'axios';

const isDev = import.meta.env.DEV;
const hostname = window.location.hostname;
const apiPort = '5134'; 

const PROD_API_URL = 'https://tu-credito-api.onrender.com/api';

const getBaseUrl = () => {
  if (isDev) return `http://${hostname}:${apiPort}/api`;
  
  const envUrl = import.meta.env.VITE_API_URL || PROD_API_URL;
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
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
