import { Vehicle } from '@/pages/management/vehicle/entity';
import apiClient from '../apiClient';

export enum VehicleApi {
   GetVehicles = 'public/vehicle/getall',
   CreateVehicle = 'private/vehicle/create',
   UpdateVehicle = 'private/vehicle/update',
   DeleteVehicle = 'private/vehicle/delete',
   UploadImage = 'private/vehicleimage/create/',
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

const createVehicle = (data: Vehicle): Promise<any> => {
   return apiClient
      .post({ url: VehicleApi.CreateVehicle, data })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            const id = res.data.metadata?.vehicle.vehicle_id;
            const vehicleName = res.data.metadata?.vehicle.vehicle_name;
            if (data.images && data.images.length > 0) {
               const formData = new FormData();
               const images = data.images.filter(
                  (image) => typeof image === 'object' && image instanceof File,
               ) as File[];
               images.forEach((image: File) => {
                  formData.append('images', image);
               });
               formData.append('vehicleName', vehicleName);
               formData.append('vehicleId', id);
               apiClient
                  .post({
                     url: `${VehicleApi.UploadImage}${id}`,
                     data: formData,
                     headers: { 'Content-Type': 'multipart/form-data' },
                  })
                  .then((res: any) => {
                     return res;
                  })
                  .catch((error) => {
                     console.error('Error uploading images', error);
                     return error;
                  });
            }
            return res;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};
const updateVehicle = (data: Vehicle): Promise<any> => {
   return apiClient
      .put({ url: VehicleApi.UpdateVehicle, data })
      .then((res: any) => {
         if (res && (res.status === 200 || res.status === 201)) {
            // Kiểm tra id từ response thay vì data
            const id = res.data.metadata?.vehicle.vehicle_id;
            const vehicleName = res.data.metadata?.vehicle.vehicle_name;

            if (data.images && data.images.length > 0) {
               const formData = new FormData();
               const images = data.images.filter(
                  (image) => typeof image === 'object' && image instanceof File,
               ) as File[];

               images.forEach((image: File) => {
                  formData.append('images', image);
               });

               formData.append('vehicleName', vehicleName);
               formData.append('vehicleId', id.toString());

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
                     console.error('Error uploading images', error);
                     return res;
                  });
            }
            return res;
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};
const deleteVehicle = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${VehicleApi.DeleteVehicle}/${id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const uploadImage = (id: string, file: File): Promise<any> => {
   const formData = new FormData();
   formData.append('image', file);
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
