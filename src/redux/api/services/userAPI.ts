import apiClient from '../apiClient';

import { UserInfo } from '#/entity';

export enum UserApi {
   GetUsersById = '/private/employee/auth/get-employee-by-id',
}

export const getUsersById = (id: string): Promise<any> => {
   return apiClient
      .get({ url: `${UserApi.GetUsersById}/${id}` })
      .then((res: any) => {
         if (res) {
            const employee = res.data.metadata?.employee;
            if (employee) {
               const userInfo: UserInfo = {
                  userId: employee.employee_id,
                  email: employee.employee_email,
                  phone: employee.employee_phone,
                  fullName: employee.employee_full_name,
                  gender: employee.employee_gender,
                  birthday: employee.employee_birthday,
                  username: employee.employee_username,
                  profileImage: employee.employee_profile_image,
               };
               return userInfo;
            }
         }
         return null;
      })
      .catch((error) => {
         return error;
      });
};
