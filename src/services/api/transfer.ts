import { api } from './config';
import { TransferType } from '../../types';

export const transferApi = {
  update: async (orderId: string, transferType: TransferType) => {
    const response = await api.put(`/orders/${orderId}/transfer`, { transferType });
    return response.data;
  },

  getStatus: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/transfer`);
    return response.data;
  }
};