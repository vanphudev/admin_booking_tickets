import apiClient from '../apiClient';
import { EmployeeType } from '@/pages/management/employee/entity';

export enum EmployeeTypeApi {
   GetAll = '/private/employee-type/getall',
   Create = '/private/employee-type/create',
   Update = '/private/employee-type/update',
   Delete = '/private/employee-type/delete',
}

interface ApiResponse<T> {
   success: boolean;
   message?: string;
   metadata?: {
      employeeTypes?: T[];
      employeeType?: T;
   };
}

interface ApiResult<T> {
   success: boolean;
   data?: T;
   message?: string;
}

const getEmployeeTypes = async (): Promise<ApiResult<EmployeeType[]>> => {
   try {
      const response = (await apiClient.get({ url: EmployeeTypeApi.GetAll })) as { data: ApiResponse<EmployeeType> };
      return {
         success: true,
         data: response.data?.metadata?.employeeTypes || [],
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể lấy danh sách loại nhân viên',
      };
   }
};

const createEmployeeType = async (
   data: Omit<EmployeeType, 'employee_type_id' | 'created_at' | 'updated_at'>,
): Promise<ApiResult<EmployeeType>> => {
   try {
      const response = (await apiClient.post({
         url: EmployeeTypeApi.Create,
         data,
      })) as { data: ApiResponse<EmployeeType> };

      return {
         success: true,
         data: response.data?.metadata?.employeeType,
         message: 'Tạo loại nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể tạo loại nhân viên',
      };
   }
};

const updateEmployeeType = async (
   data: Partial<EmployeeType> & { employee_type_id: number },
): Promise<ApiResult<EmployeeType>> => {
   try {
      const response = (await apiClient.put({
         url: `${EmployeeTypeApi.Update}/${data.employee_type_id}`,
         data,
      })) as { data: ApiResponse<EmployeeType> };

      return {
         success: true,
         data: response.data?.metadata?.employeeType,
         message: 'Cập nhật loại nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể cập nhật loại nhân viên',
      };
   }
};

const deleteEmployeeType = async (employee_type_id: number): Promise<ApiResult<never>> => {
   try {
      const response = (await apiClient.delete({
         url: `${EmployeeTypeApi.Delete}/${employee_type_id}`,
      })) as { data: ApiResponse<never> };

      return {
         success: true,
         message: 'Xóa loại nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể xóa loại nhân viên',
      };
   }
};

export default {
   getEmployeeTypes,
   createEmployeeType,
   updateEmployeeType,
   deleteEmployeeType,
};
