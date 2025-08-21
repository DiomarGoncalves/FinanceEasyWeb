import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'
});

// Interceptor para tokens
api.interceptors.request.use(config => {
  const token = localStorage.getItem('@FinanceApp:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Token inválido ou expirado, deslogar usuário
      localStorage.removeItem('@FinanceApp:token');
      console.log('Token inválido, redirecionando para login');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);