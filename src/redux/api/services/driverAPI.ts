import { Driver } from '@/pages/management/driver/entity';
import apiClient from '../apiClient';

export enum DriverApi {
   GetDrivers = '/public/driver/all',
   CreateDriver = '/private/driver/create',
   UpdateDriver = '/private/driver/update',
   DeleteDriver = '/private/driver/delete',
}

interface ApiResponse {
   success: boolean;
   message?: string;
   metadata?: {
      drivers?: Driver[];
      driver?: Driver;
   };
}

const getDrivers = async () => {
   try {
      const response = (await apiClient.get({ url: DriverApi.GetDrivers })) as { data: ApiResponse };
      return response.data?.metadata?.drivers || [];
   } catch (error) {
      console.error('Lỗi getDrivers:', error);
      throw error;
   }
};

const createDriver = async (data: Partial<Driver>) => {
   try {
      const response = (await apiClient.post({
         url: DriverApi.CreateDriver,
         data,
      })) as { data: ApiResponse };
      return {
         success: response.data?.success || false,
         data: response.data?.metadata?.driver,
         message: response.data?.message,
      };
   } catch (error) {
      console.error('Lỗi createDriver:', error);
      throw error;
   }
};

const updateDriver = async (data: Partial<Driver>) => {
   try {
      const response = (await apiClient.put({
         url: `${DriverApi.UpdateDriver}/${data.driver_id}`,
         data,
      })) as { data: ApiResponse };
      return {
         success: response.data?.success || false,
         data: response.data?.metadata?.driver,
         message: response.data?.message,
      };
   } catch (error) {
      console.error('Lỗi updateDriver:', error);
      throw error;
   }
};

const deleteDriver = async (driver_id: number) => {
   try {
      const response = (await apiClient.delete({
         url: `${DriverApi.DeleteDriver}/${driver_id}`,
      })) as { data: ApiResponse };
      return {
         success: response.data?.success || false,
         message: response.data?.message,
      };
   } catch (error) {
      console.error('Lỗi deleteDriver:', error);
      throw error;
   }
};

export default {
   getDrivers,
   createDriver,
   updateDriver,
   deleteDriver,
};
