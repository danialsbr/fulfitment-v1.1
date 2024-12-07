export * from './types';
export * from './config';

import { ordersApi } from './orders';
import { uploadApi } from './upload';
import { systemApi } from './system';

export const fulfillmentApi = {
  orders: ordersApi,
  upload: uploadApi,
  system: systemApi,
};