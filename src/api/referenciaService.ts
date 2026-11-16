import axiosClient from './axiosClient';

export const referenciaService = {
  getAll: async () => {
    const response = await axiosClient.get('/referencias');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await axiosClient.get(`/referencias/${id}`);
    return response.data;
  }
};
