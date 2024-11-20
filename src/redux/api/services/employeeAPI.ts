import axios from 'axios';
import { Employee, EmployeeFormValues } from '@/pages/management/employee/entity';

const API_URL = '/api/employees';

const getAllEmployees = async () => {
   const response = await axios.get(API_URL);
   return response.data;
};

const getEmployeeById = async (employeeId: number) => {
   const response = await axios.get(`${API_URL}/${employeeId}`);
   return response.data;
};

const createEmployee = async (data: EmployeeFormValues) => {
   const response = await axios.post(API_URL, data);
   return response.data;
};

const updateEmployee = async (employeeId: number, data: EmployeeFormValues) => {
   const response = await axios.put(`${API_URL}/${employeeId}`, data);
   return response.data;
};

const deleteEmployee = async (employeeId: number) => {
   const response = await axios.delete(`${API_URL}/${employeeId}`);
   return response.data;
};

export default {
   getAllEmployees,
   getEmployeeById,
   createEmployee,
   updateEmployee,
   deleteEmployee,
};
