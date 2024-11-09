import { PaymentMethod } from '@/pages/management/method-payment/entity';
import apiClient from '../apiClient';

const getPaymentMethods = (): Promise<any> => {
   return apiClient
      .get({ url: 'private/payment-method/all' })
      .then((res: any) => {
         console.log('API Response:', res);
         if (res?.data?.metadata?.paymentMethods) {
            return res.data.metadata.paymentMethods;
         }
         return [];
      })
      .catch((error) => {
         console.log('Lỗi getPaymentMethods', error);
         throw error;
      });
};

const getPaymentTypes = (): Promise<any> => {
   return apiClient
      .get({ url: 'private/payment-type/all' })
      .then((res: any) => {
         if (res?.data?.metadata?.paymentTypes) {
            return res.data.metadata.paymentTypes;
         }
         return [];
      })
      .catch((error) => {
         console.log('Lỗi getPaymentTypes', error);
         throw error;
      });
};

const createPaymentMethod = (data: FormData | PaymentMethod): Promise<any> => {
   return apiClient
      .post({
         url: 'private/payment-method/create',
         data,
         headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      .then((res: any) => res)
      .catch((error) => {
         throw error;
      });
};

const updatePaymentMethod = (id: string, data: FormData | PaymentMethod): Promise<any> => {
   return apiClient
      .put({
         url: `private/payment-method/update/${id}`,
         data,
         headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      .then((res: any) => res)
      .catch((error) => {
         throw error;
      });
};

const deletePaymentMethod = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `private/payment-method/delete/${id}` })
      .then((res: any) => res)
      .catch((error) => {
         throw error;
      });
};

export default {
   getPaymentMethods,
   getPaymentTypes,
   createPaymentMethod,
   updatePaymentMethod,
   deletePaymentMethod,
};
