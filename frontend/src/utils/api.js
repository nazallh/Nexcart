import axios from 'axios';

// ✅ Use environment variable (works for local + Vercel)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

// ✅ Attach token automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('nexcart_user') || 'null');

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default API;
