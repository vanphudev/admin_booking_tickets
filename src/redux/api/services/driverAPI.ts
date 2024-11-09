import { Driver } from '@/pages/management/driver/entity';
import apiClient from '../apiClient';

export enum DriverApi {
   GetDrivers = 'private/driver/all',
   CreateDriver = 'private/driver/create',
   UpdateDriver = 'private/driver/update',
   DeleteDriver = 'private/driver/delete',
}

const getDrivers = (): Promise<any> => {
   return apiClient
      .get({ url: DriverApi.GetDrivers })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.drivers;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getDrivers', error);
         return error;
      });
};

const createDriver = (data: FormData): Promise<any> => {
   return apiClient
      .post({
         url: DriverApi.CreateDriver,
         data,
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const updateDriver = (data: FormData): Promise<any> => {
   return apiClient
      .put({
         url: DriverApi.UpdateDriver,
         data,
         headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const deleteDriver = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${DriverApi.DeleteDriver}/${id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getDrivers,
   createDriver,
   updateDriver,
   deleteDriver,
};
