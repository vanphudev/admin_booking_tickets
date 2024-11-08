import { Office } from '@/pages/management/office/entity';

import apiClient from '../apiClient';

export enum OfficeApi {
   GetOffices = 'public/office/getall',
   CreateOffice = 'private/office/create',
   UpdateOffice = 'private/office/update',
   DeleteOffice = 'private/office/delete',
   UploadImage = 'private/officeimage/create/',
}

const getOffices = (): Promise<any> => {
   return apiClient
      .get({ url: OfficeApi.GetOffices })
      .then((res: any) => {
         if (res) {
            return res.data?.metadata?.offices;
         }
         return null;
      })
      .catch((error) => {
         console.log('Lỗi getOffices', error);
         return error;
      });
};

const createOffice = (data: Office): Promise<any> => {
   return apiClient
      .post({ url: OfficeApi.CreateOffice, data })
      .then((res: any) => {
         if (res && (res.status === 201 || res.status === 200)) {
            const id = res.data.metadata?.office.office_id;
            const officeName = res.data.metadata?.office.office_name;
            if (data.images && data.images.length > 0) {
               const formData = new FormData();
               const images = data.images.filter(
                  (image) => typeof image === 'object' && image instanceof File,
               ) as File[];
               images.forEach((image: File) => {
                  formData.append('images', image);
               });
               formData.append('officeName', officeName);
               formData.append('officeId', id);
               apiClient
                  .post({
                     url: `${OfficeApi.UploadImage}${id}`,
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

const updateOffice = (data: Office): Promise<any> => {
   return apiClient
      .put({ url: OfficeApi.UpdateOffice, data })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const deleteOffice = (id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${OfficeApi.DeleteOffice}/${id}` })
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
         url: `${OfficeApi.UploadImage}${id}`,
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
   getOffices,
   createOffice,
   updateOffice,
   deleteOffice,
   uploadImage,
};
