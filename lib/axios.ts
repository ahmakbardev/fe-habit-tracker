import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Laravel backend
  withCredentials: true, // penting untuk Sanctum
});

export default api;
