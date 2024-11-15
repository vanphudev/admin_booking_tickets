import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { Employee } from '@/pages/management/employee/entity';
import employeeAPI from '../api/services/employeeAPI';
import { RootState } from '../stores/store';

interface EmployeeState {
   employees: Employee[];
   selectedEmployee: Employee | null;
   loading: boolean;
   error: string | null;
}

const initialState: EmployeeState = {
   employees: [],
   selectedEmployee: null,
   loading: false,
   error: null,
};

export const fetchEmployees = createAsyncThunk('employee/fetchEmployees', async (_, { rejectWithValue }) => {
   try {
      const response = await employeeAPI.getEmployees();
      if (response.success && response.data) {
         return response.data;
      }
      return rejectWithValue(response.message || 'Không thể lấy danh sách nhân viên');
   } catch (error: any) {
      return rejectWithValue(error.message);
   }
});

export const createEmployee = createAsyncThunk(
   'employee/createEmployee',
   async (data: Partial<Employee>, { rejectWithValue }) => {
      try {
         const response = await employeeAPI.createEmployee(data);
         if (response.success && response.data) {
            notification.success({ message: response.message });
            return response.data;
         }
         return rejectWithValue(response.message || 'Không thể tạo nhân viên');
      } catch (error: any) {
         return rejectWithValue(error.message);
      }
   },
);

export const updateEmployee = createAsyncThunk(
   'employee/updateEmployee',
   async (data: Partial<Employee>, { rejectWithValue }) => {
      try {
         const response = await employeeAPI.updateEmployee(data);
         if (response.success && response.data) {
            notification.success({ message: response.message });
            return response.data;
         }
         return rejectWithValue(response.message || 'Không thể cập nhật nhân viên');
      } catch (error: any) {
         return rejectWithValue(error.message);
      }
   },
);

export const deleteEmployee = createAsyncThunk(
   'employee/deleteEmployee',
   async (employee_id: number, { rejectWithValue }) => {
      try {
         const response = await employeeAPI.deleteEmployee(employee_id);
         if (response.success) {
            notification.success({ message: response.message });
            return employee_id;
         }
         return rejectWithValue(response.message || 'Không thể xóa nhân viên');
      } catch (error: any) {
         return rejectWithValue(error.message);
      }
   },
);

const employeeSlice = createSlice({
   name: 'employee',
   initialState,
   reducers: {
      setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
         state.selectedEmployee = action.payload;
      },
      clearSelectedEmployee: (state) => {
         state.selectedEmployee = null;
      },
      clearError: (state) => {
         state.error = null;
      },
   },
   extraReducers: (builder) => {
      // Fetch employees
      builder
         .addCase(fetchEmployees.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchEmployees.fulfilled, (state, action) => {
            state.loading = false;
            state.employees = action.payload;
         })
         .addCase(fetchEmployees.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            notification.error({ message: action.payload as string });
         });

      // Create employee
      builder
         .addCase(createEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(createEmployee.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
               state.employees.push(action.payload);
            }
         })
         .addCase(createEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            notification.error({ message: action.payload as string });
         });

      // Update employee
      builder
         .addCase(updateEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(updateEmployee.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload) {
               const index = state.employees.findIndex((emp) => emp.employee_id === action.payload.employee_id);
               if (index !== -1) {
                  state.employees[index] = action.payload;
               }
            }
         })
         .addCase(updateEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            notification.error({ message: action.payload as string });
         });

      // Delete employee
      builder
         .addCase(deleteEmployee.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(deleteEmployee.fulfilled, (state, action) => {
            state.loading = false;
            state.employees = state.employees.filter((emp) => emp.employee_id !== action.payload);
         })
         .addCase(deleteEmployee.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            notification.error({ message: action.payload as string });
         });
   },
});

export const { setSelectedEmployee, clearSelectedEmployee, clearError } = employeeSlice.actions;

export const selectEmployees = (state: RootState) => state.employee.employees;
export const selectSelectedEmployee = (state: RootState) => state.employee.selectedEmployee;
export const selectEmployeeLoading = (state: RootState) => state.employee.loading;
export const selectEmployeeError = (state: RootState) => state.employee.error;

export default employeeSlice.reducer;
