import apiClient from '../apiClient';
import { EmployeeType } from '@/pages/management/employeeType/entity';

export enum EmployeeTypeApi {
   GetAll = '/private/employee-type/getall',
   Create = '/private/employee-type/create',
   Update = '/private/employee-type/update',
   Delete = '/private/employee-type/delete',
}

const getEmployeeTypes = (): Promise<any> => {
   return apiClient
      .get({ url: EmployeeTypeApi.GetAll })
      .then((res: any) => {
         if (res?.data?.metadata?.employeeTypes) {
            return res.data.metadata.employeeTypes;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi getEmployeesType:', error);
         throw error;
      });
};

const createEmployeeType = async (data: Omit<EmployeeType, 'employee_type_id' | 'created_at' | 'updated_at'>) => {
   try {
      const response = await apiClient.post({
         url: EmployeeTypeApi.Create,
         data,
      });
      if (response?.data?.metadata?.employeeType) {
         return {
            success: true,
            data: response.data.metadata.employeeType,
         };
      }
      return {
         success: false,
         message: response?.data?.message || 'Không thể tạo loại nhân viên',
      };
   } catch (error: any) {
      console.error('Lỗi createEmployeeType:', error);
      throw error;
   }
};

const updateEmployeeType = async (data: Partial<EmployeeType> & { employee_type_id: number }) => {
   try {
      const response = await apiClient.put({
         url: `${EmployeeTypeApi.Update}/${data.employee_type_id}`,
         data,
      });
      if (response?.data?.metadata?.employeeType) {
         return {
            success: true,
            data: response.data.metadata.employeeType,
         };
      }
      return {
         success: false,
         message: response?.data?.message || 'Không thể cập nhật loại nhân viên',
      };
   } catch (error: any) {
      console.error('Lỗi updateEmployeeType:', error);
      throw error;
   }
};

const deleteEmployeeType = async (employee_type_id: number) => {
   try {
      const response = await apiClient.delete({
         url: `${EmployeeTypeApi.Delete}/${employee_type_id}`,
      });
      if (response?.data?.success) {
         return {
            success: true,
            message: response.data.message,
         };
      }
      return {
         success: false,
         message: response?.data?.message || 'Không thể xóa loại nhân viên',
      };
   } catch (error: any) {
      console.error('Lỗi deleteEmployeeType:', error);
      throw error;
   }
};

export default {
   getEmployeeTypes,
   createEmployeeType,
   updateEmployeeType,
   deleteEmployeeType,
};