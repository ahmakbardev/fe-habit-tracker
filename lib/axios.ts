import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api', 
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  }
});

api.interceptors.request.use(config => {
  console.log(`🚀 %cSending ${config.method?.toUpperCase()} to ${config.url}`, 'color: #007bff; font-weight: bold;');
  return config;
});

api.interceptors.response.use(
  response => {
    console.log(`✅ %cReceived from ${response.config?.url}`, 'color: #28a745; font-weight: bold;', response.data);
    return response;
  },
  error => {
    // [FIX] Pastikan error.config ada sebelum akses .url
    const url = error.config?.url || 'unknown url';
    console.error(`❌ %cError from ${url}`, 'color: #dc3545; font-weight: bold;', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
