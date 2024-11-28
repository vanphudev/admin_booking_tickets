
import apiClient from '../apiClient';

export enum VoucherApi {
   GetVouchers = 'public/vouchers/getall',
   CreateVoucher = 'private/vouchers/create',
   UpdateVoucher = 'private/vouchers/update',
   DeleteVoucher = 'private/vouchers/delete',
}

const getVouchers = (): Promise<any> => {
   return apiClient
      .get({ url: VoucherApi.GetVouchers })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.vouchers;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getOffices', error);
         return error;
      });
};

const createVoucher = async (data: any): Promise<any> => {
   try {
      const res = (await apiClient.post({
         url: VoucherApi.CreateVoucher,
         data,
      })) as any;
      if (!res || !res.data) {
         console.error('Response from Create voucher API is missing or invalid');
         return null;
      }
      return res.data;
   } catch (error) {
      console.error('Error creating voucher', error);
      throw error;
   }
};
const deleteVoucher = (voucher_id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${VoucherApi.DeleteVoucher}/${voucher_id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};
const updateVoucher = async (data: any): Promise<any> => {
   try {
      const res = (await apiClient.put({ url: VoucherApi.UpdateVoucher, data })) as any;
      if (!res || !res.data) {
         console.error('Response from Create voucher API is missing or invalid');
         return null;
      }
      return res.data;
   } catch (error) {
      console.error('Error updating voucher', error);
      throw error;
   }
};

export default {
   getVouchers,
   createVoucher,
   deleteVoucher,
   updateVoucher,
};
