import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://monostyle.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar automáticamente el token JWT a las peticiones
axiosClient.interceptors.request.use(
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

export default axiosClient;