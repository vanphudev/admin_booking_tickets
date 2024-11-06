import apiClient from '../apiClient';

export enum OfficeApi {
   GetOffices = 'public/office/getall',
}

const getOffices = (): Promise<any> => {
   return apiClient
      .get({ url: OfficeApi.GetOffices })
      .then((res: any) => {
         if (res) {
            return res;
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   getOffices,
};
