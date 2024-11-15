import { Employee } from '@/pages/management/employee/entity';
import apiClient from '../apiClient';

export enum EmployeeApi {
   GetEmployees = '/private/employee/auth/getall',
   CreateEmployee = '/private/employee/auth/create',
   UpdateEmployee = '/private/employee/auth/update',
   DeleteEmployee = '/private/employee/auth/delete',
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

const createEmployee = (data: Partial<Employee>) => {
   return apiClient
      .post({
         url: EmployeeApi.CreateEmployee,
         data,
      })
      .then((res) => {
         if (res?.data?.metadata?.employee) {
            return res.data.metadata.employee;
         }
         return null;
      })
      .catch((error) => {
         console.error('Lỗi createEmployee:', error);
         throw error;
      });
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

const deleteEmployee = (employee_id: number) => {
   return apiClient
      .delete({
         url: `${EmployeeApi.DeleteEmployee}/${employee_id}`,
      })
      .then((res) => {
         return res.data;
      })
      .catch((error) => {
         console.error('Lỗi deleteEmployee:', error);
         throw error;
      });
};

export default {
   getEmployees,
   createEmployee,
   updateEmployee,
   deleteEmployee,
};