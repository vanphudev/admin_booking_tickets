import apiClient from '../apiClient';
import { PaymentMethod } from '@/pages/management/method-payment/entity';

export enum PaymentMethodApi {
   GetPaymentMethods = 'public/payment-method/getall',
   CreatePaymentMethod = 'private/payment-method/create',
   UpdatePaymentMethod = 'private/payment-method/update',
   DeletePaymentMethod = 'private/payment-method/delete',
   UploadImage = 'private/paymentmethodimage/create',
   UpdateImage = 'private/paymentmethodimage/update',
}
const getPaymentMethods = (): Promise<any> => {
   return apiClient
      .get({ url: PaymentMethodApi.GetPaymentMethods })
      .then((res: any) => {
         console.log('API Response:', res);
         if (res && res.data) {
            return res.data?.metadata?.methods;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getPaymentMethods', error);
         return error;
      });
};

const createPaymentMethod = async (data: PaymentMethod): Promise<any> => {
   try {
      const res = (await apiClient.post({
         url: PaymentMethodApi.CreatePaymentMethod,
         data,
      })) as any;
      if (!res || !res.data) {
         console.error('Response from CreatePaymentMethod API is missing or invalid', res);
         return res;
      }
      const { metadata } = res.data;
      if (!metadata || !metadata.payment_method) {
         console.warn('Metadata or payment method information is missing in response', res.data);
         return res;
      }
      const { payment_method_id: id, payment_method_name: paymentMethodName } = metadata.payment_method;
      if (!id || !paymentMethodName) {
         console.warn('Missing Payment Method ID or payment method name in response', metadata.payment_method);
         return res;
      }
      return res;
   } catch (error) {
      console.error('Error creating payment method', error);
      throw error;
   }
};

const updatePaymentMethod = async (data: PaymentMethod): Promise<any> => {
   try {
      const res = (await apiClient.put({ url: PaymentMethodApi.UpdatePaymentMethod, data })) as any;
      if (!res || !res.data) {
         console.error('Response from UpdatePaymentMethod API is missing or invalid', res);
         return res;
      }
      const { metadata } = res.data;
      if (!metadata || !metadata.payment_method) {
         console.warn('Metadata or Payment Method information is missing in response', res.data);
         return res;
      }
      const { payment_method_id: id, payment_method_name: paymentMethodName } = metadata.payment_method;
      if (!id || !paymentMethodName) {
         console.warn('Missing Payment Method ID or payment method name in response', metadata.payment_method);
         return res;
      }
      return res;
   } catch (error) {
      console.error('Error updating Payment Method', error);
      throw error;
   }
};

const deletePaymentMethod = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${PaymentMethodApi.DeletePaymentMethod}/${id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};
const uploadImage = (id: string, file: File): Promise<any> => {
   const formData = new FormData();
   formData.append('images', file);
   return apiClient
      .post({
         url: `${PaymentMethodApi.UploadImage}${id}`,
         data: formData,
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getPaymentMethods,
   createPaymentMethod,
   updatePaymentMethod,
   deletePaymentMethod,
   uploadImage,
};
