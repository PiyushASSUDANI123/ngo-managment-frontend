import axios from 'axios';

const API = axios.create({
  baseURL: 'https://envision.piyushassudani.in/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('ngo_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ngo_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
