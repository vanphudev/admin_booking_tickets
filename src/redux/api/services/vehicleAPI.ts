import apiClient from '../apiClient';
import { Vehicle } from '@/pages/management/vehicle/entity';

export enum VehicleApi {
   GetVehicles = 'public/vehicle/getall',
   CreateVehicle = 'private/vehicle/create',
   UpdateVehicle = 'private/vehicle/update',
   DeleteVehicle = 'private/vehicle/delete',
   UploadImage = 'private/vehicleimage/create',
   UpdateImage = 'private/vehicleimage/update',
}

const getVehicles = (): Promise<any> => {
   return apiClient
      .get({ url: VehicleApi.GetVehicles })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.vehicles;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getVehicles', error);
         return error;
      });
};

const createVehicle = async (data: Vehicle): Promise<any> => {
   try {
      const res = (await apiClient.post({
         url: VehicleApi.CreateVehicle,
         data,
      })) as any;
      if (!res || !res.data) {
         console.error('Response from CreateVehicle API is missing or invalid', res);
         return res;
      }
      const { metadata } = res.data;
      if (!metadata || !metadata.vehicle) {
         console.warn('Metadata or vehicle information is missing in response', res.data);
         return res;
      }
      const { vehicle_id: id, vehicle_code: vehicleCode } = metadata.vehicle;
      if (!id || !vehicleCode) {
         console.warn('Missing vehicle ID or office name in response', metadata.vehicle);
         return res;
      }
      if (data.images && data.images.length > 0) {
         const formData = new FormData();
         data.images.forEach((file) => formData.append('images', file));
         try {
            const uploadRes = await apiClient.post({
               url: VehicleApi.UploadImage,
               data: formData,
               headers: {
                  'Content-Type': 'multipart/form-data',
                  vehicleId: id.toString(),
                  vehicleCode: encodeURIComponent(vehicleCode),
               },
            });
            return { ...res, imageUpload: uploadRes };
         } catch (uploadError) {
            console.error('Error uploading images', uploadError);
            throw new Error('Failed to upload images');
         }
      }

      return res;
   } catch (error) {
      console.error('Error creating office', error);
      throw error;
   }
};

const updateVehicle = async (data: Vehicle): Promise<any> => {
   try {
      const res = (await apiClient.put({ url: VehicleApi.UpdateVehicle, data })) as any;
      if (!res || !res.data) {
         console.error('Response from UpdateVehicle API is missing or invalid', res);
         return res;
      }
      const { metadata } = res.data;
      if (!metadata || !metadata.vehicle) {
         console.warn('Metadata or Vehile information is missing in response', res.data);
         return res;
      }
      const { vehicle_id: id, vehicle_license_plate: vehicleName } = metadata.vehicle;
      if (!id || !vehicleName) {
         console.warn('Missing vehicle ID or vehicle name in response', metadata.vehicle);
         return res;
      }
      const formData = new FormData();
      (data.images == null || data.images.length === 0) && formData.append('images', '');
      data.images && data.images.forEach((file) => formData.append('images', file));
      try {
         const uploadRes = await apiClient.put({
            url: VehicleApi.UpdateImage,
            data: formData,
            headers: {
               'Content-Type': 'multipart/form-data',
               vehicleId: id.toString(),
               vehicleCode: encodeURIComponent(vehicleName),
            },
         });
         return { ...res, imageUpload: uploadRes };
      } catch (uploadError) {
         console.error('Error uploading images', uploadError);
         throw new Error('Failed to upload images');
      }
      return res;
   } catch (error) {
      console.error('Error updating Vehicle', error);
      throw error;
   }
};
const deleteVehicle = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${VehicleApi.DeleteVehicle}/${id}` }) // Đảm bảo rằng bạn đang sử dụng params
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         console.error('Error deleting vehicle:', error);
         throw error; // Ném lại lỗi để xử lý ở nơi gọi
      });
};
const uploadImage = (id: string, file: File): Promise<any> => {
   const formData = new FormData();
   formData.append('images', file);
   return apiClient
      .post({
         url: `${VehicleApi.UploadImage}${id}`,
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
   getVehicles,
   createVehicle,
   updateVehicle,
   deleteVehicle,
   uploadImage,
};
