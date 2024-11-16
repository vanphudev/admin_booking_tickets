import { Voucher } from '@/pages/management/voucher/entity';
import apiClient from '../apiClient';

export enum VoucherApi {
   GetVouchers = 'public/vouchers/getall',
   CreateVoucher = 'private/vouchers/create',
   UpdateVoucher = 'private/vouchers/update',
   DeleteVoucher = 'private/vouchers/delete',
}

const getVouchers = () => {
   return apiClient
      .get({ url: VoucherApi.GetVouchers })
      .then((res) => {
         if (res?.data?.metadata?.vouchers) {
            return res.data.metadata.vouchers;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi getVouchers:', error);
         throw error;
      });
};

const createVoucher = (data: Partial<Voucher>) => {
   return apiClient
      .post({
         url: VoucherApi.CreateVoucher,
         data,
      })
      .then((res) => {
         if (res?.data?.metadata?.voucher) {
            return res.data.metadata.voucher;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi createVoucher:', error);
         throw error;
      });
};

const updateVoucher = (data: Partial<Voucher>) => {
   return apiClient
      .put({
         url: `${VoucherApi.UpdateVoucher}/${data.voucher_id}`,
         data,
      })
      .then((res) => {
         if (res?.data?.metadata?.voucher) {
            return res.data.metadata.voucher;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi updateVoucher:', error);
         throw error;
      });
};

const deleteVoucher = (voucher_id: number) => {
   return apiClient
      .delete({
         url: `${VoucherApi.DeleteVoucher}/${voucher_id}`,
      })
      .then((res) => {
         return res.data;
      })
      .catch((error) => {
         console.error('Lỗi deleteVoucher:', error);
         throw error;
      });
};

export default {
   getVouchers,
   createVoucher,
   updateVoucher,
   deleteVoucher,
};
