import axios from 'axios';

// Configuração da API
const api = axios.create({
  baseURL: "https://dashboard-nordeste-conectado-backend.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
