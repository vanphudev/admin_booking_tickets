import { useNavigate } from 'react-router-dom';

import { setUserInfoAndToken, clearUserInfoAndToken } from '@/redux/slices/userSlice';
import { store } from '@/redux/stores/store';
import { setItem, removeItem } from '@/utils/storage';

import apiClient from '../apiClient';

import { UserInfo, UserToken } from '#/entity';
import { StorageEnum } from '#/enum';

export interface SignInReq {
   username: string;
   password: string;
}

export interface UserStore {
   state: {
      userInfo: UserInfo;
      userToken: UserToken;
   };
}

export enum UserApi {
   SignIn = '/public/employee/auth/signin',
   Logout = '/private/employee/auth/signout',
}

const signin = (data: SignInReq) => {
   return apiClient
      .post({ url: UserApi.SignIn, data })
      .then((res: any) => {
         if (res) {
            const userInfo: UserInfo = {
               userId: res.data.metadata.employee.employee_id,
               email: res.data.metadata.employee.employee_email,
               phone: res.data.metadata.employee.employee_phone,
               fullName: res.data.metadata.employee.employee_full_name,
               gender: res.data.metadata.employee.employee_gender,
               birthday: res.data.metadata.employee.employee_birthday,
               username: res.data.metadata.employee.employee_username,
               profileImage: res.data.metadata.employee.employee_profile_image,
            };
            const userToken: UserToken = {
               accessToken: res.data.metadata.tokens.accessToken,
               refreshToken: res.data.metadata.tokens.refreshToken,
            };
            store.dispatch(
               setUserInfoAndToken({
                  userInfo,
                  userToken,
               }),
            );
            setItem(StorageEnum.UserInfo, userInfo);
            setItem(StorageEnum.UserToken, userToken);
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

const logout = () => {
   return apiClient
      .post({ url: UserApi.Logout })
      .then((res: any) => {
         if (res && res.data) {
            store.dispatch(clearUserInfoAndToken());
            removeItem(StorageEnum.UserInfo);
            removeItem(StorageEnum.UserToken);
         }
         return res;
      })
      .catch((error) => {
         return error;
      });
};

export default {
   signin,
   logout,
};
