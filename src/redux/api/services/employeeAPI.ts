import { Employee } from '@/pages/management/employee/entity';
import apiClient from '../apiClient';

export enum EmployeeApi {
   GetEmployees = '/private/employee/auth/getall',
   CreateEmployee = '/private/employee/auth/create',
   UpdateEmployee = '/private/employee/auth/update',
   DeleteEmployee = '/private/employee/auth/delete',
}

interface ApiResponse<T> {
   success: boolean;
   message?: string;
   metadata?: {
      employees?: T[];
      employee?: T;
   };
}

interface ApiResult<T> {
   success: boolean;
   data?: T;
   message?: string;
}

const getEmployees = async (): Promise<ApiResult<Employee[]>> => {
   try {
      const response = (await apiClient.get({
         url: EmployeeApi.GetEmployees,
      })) as { data: ApiResponse<Employee> };

      return {
         success: true,
         data: response.data?.metadata?.employees || [],
         message: 'Lấy danh sách nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể lấy danh sách nhân viên',
      };
   }
};

const createEmployee = async (data: Partial<Employee>): Promise<ApiResult<Employee>> => {
   try {
      const response = (await apiClient.post({
         url: EmployeeApi.CreateEmployee,
         data,
      })) as { data: ApiResponse<Employee> };

      return {
         success: true,
         data: response.data?.metadata?.employee,
         message: 'Tạo nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể tạo nhân viên',
      };
   }
};

const updateEmployee = async (data: Partial<Employee>): Promise<ApiResult<Employee>> => {
   try {
      const response = (await apiClient.put({
         url: `${EmployeeApi.UpdateEmployee}/${data.employee_id}`,
         data,
      })) as { data: ApiResponse<Employee> };

      return {
         success: true,
         data: response.data?.metadata?.employee,
         message: 'Cập nhật nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể cập nhật nhân viên',
      };
   }
};

const deleteEmployee = async (employee_id: number): Promise<ApiResult<never>> => {
   try {
      const response = (await apiClient.delete({
         url: `${EmployeeApi.DeleteEmployee}/${employee_id}`,
      })) as { data: ApiResponse<never> };

      return {
         success: true,
         message: 'Xóa nhân viên thành công',
      };
   } catch (error: any) {
      return {
         success: false,
         message: error.message || 'Không thể xóa nhân viên',
      };
   }
};

   GetEmployees = '/private/employee/getall',
   CreateEmployee = '/private/employee/create',
   UpdateEmployee = '/private/employee/update',
   DeleteEmployee = '/private/employee/delete',
}

const getEmployees = (): Promise<any> => {
   return apiClient
      .get({ url: EmployeeApi.GetEmployees })
      .then((res: any) => {
         if (res?.data?.metadata?.employees) {
            return res.data.metadata.employees;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi getEmployees:', error);
         throw error;
      });
};

const createEmployee = async (data: any): Promise<any> => {
   console.log('Creating employee with data:', data);
   try {
      const res = (await apiClient.post({
         url: EmployeeApi.CreateEmployee,
         data,
      })) as any;
      if (!res || !res.data) {
         console.error('Response from Create employee API is missing or invalid');
         return null;
      }
      return res.data;
   } catch (error) {
      console.error('Error creating employee:', error.response?.data || error.message);
      throw error;
   }
};
const updateEmployee = (data: Partial<Employee>) => {
   return apiClient
      .put({
         url: `${EmployeeApi.UpdateEmployee}/${data.employee_id}`,
         data,
      })
      .then((res) => {
         if (res?.data?.metadata?.employee) {
            return res.data.metadata.employee;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi updateEmployee:', error);
         throw error;
      });
};

const deleteEmployee = (employee_id: string): Promise<any> => {
   return apiClient
      .delete({ url: `${EmployeeApi.DeleteEmployee}/${employee_id}` })
      .then((res: any) => {
         return res;
      })
      .catch((error) => {
         return error;
      });
};
export default {
   getEmployees,
   createEmployee,
   updateEmployee,
   deleteEmployee,
};
