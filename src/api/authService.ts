import axiosClient from './axiosClient';

export interface LoginCredentials {
  username: string;
  password: string; // Cambiado a string (en lugar de Object)
}

export interface RegisterUserData {
  nombre: string;
  correo: string;
  telefono?: string;
  cargo?: string;
  credenciales?: string;
  idRol?: number;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Mapeamos los campos del frontend a lo que el backend de Java espera (nombre y credenciales)
    const payload = {
      nombre: credentials.username,
      credenciales: credentials.password
    };

    const response = await axiosClient.post('/api/auth/login', payload);

    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  registerEmployee: async (userData: RegisterUserData) => {
    const response = await axiosClient.post('/empleados/crear', userData);
    return response.data;
  },

  registerCustomer: async (userData: RegisterUserData) => {
    const response = await axiosClient.post('/clientes', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};