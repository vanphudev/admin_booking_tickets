import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { notification } from 'antd';
// import { Employee } from '@/pages/management/employee/entity';
// import employeeAPI from '../api/services/employeeAPI';
// import { RootState } from '../stores/store';

// interface EmployeeState {
//    employees: Employee[];
//    selectedEmployee: Employee | null;
//    employeeInfo: Employee | null;
//    loading: boolean;
//    error: string | null;
// }

// const initialState: EmployeeState = {
//    employees: [],
//    selectedEmployee: null,
//    employeeInfo: null,
//    loading: false,
//    error: null,
// };

// // Async thunks
// export const fetchEmployees = createAsyncThunk(
//    'employee/fetchEmployees',
//    async (_, { rejectWithValue }) => {
//       try {
//          const response = await employeeAPI.getEmployees();
//          if (response.success && response.data) {
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Không thể tải danh sách nhân viên');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// export const createEmployee = createAsyncThunk(
//    'employee/createEmployee',
//    async (data: Omit<Employee, 'employee_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
//       try {
//          const response = await employeeAPI.createEmployee(data);
//          if (response.success && response.data) {
//             // Sửa đổi để loại bỏ ký tự thừa
//             notification.success({ 
//                message: 'Tạo nhân viên thành công', 
//                description: `Nhân viên ${response.data.employee_full_name} đã được tạo.`
//             });
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Tạo nhân viên thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// export const updateEmployee = createAsyncThunk(
//    'employee/updateEmployee',
//    async (data: Partial<Employee> & { employee_id: number }, { rejectWithValue }) => {
//       try {
//          const response = await employeeAPI.updateEmployee(data);
//          if (response.success && response.data) {
//             notification.success({ message: response.message || 'Cập nhật nhân viên thành công' });
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Cập nhật nhân viên thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// export const deleteEmployee = createAsyncThunk(
//    'employee/deleteEmployee',
//    async (employeeId: number, { rejectWithValue }) => {
//       try {
//          const response = await employeeAPI.deleteEmployee(employeeId);
//          if (response.success) {
//             notification.success({ message: response.message || 'Xóa nhân viên thành công' });
//             return employeeId;
//          }
//          return rejectWithValue(response.message || 'Xóa nhân viên thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// const employeeSlice = createSlice({
//    name: 'employee',
//    initialState,
//    reducers: {
//       clearEmployees: (state) => {
//          state.employees = [];
//       },
//       setSelectedEmployee: (state, action) => {
//          state.selectedEmployee = action.payload;
//       },
//       setEmployeeInfo: (state, action) => {
//          state.employeeInfo = action.payload;
//       },
//       clearEmployeeInfo: (state) => {
//          state.employeeInfo = null;
//       },
//       clearError: (state) => {
//          state.error = null;
//       },
//    },
//    extraReducers: (builder) => {
//       // Fetch employees
//       builder
//          .addCase(fetchEmployees.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(fetchEmployees.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employees = action.payload;
//          })
//          .addCase(fetchEmployees.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          })

//       // Create employee
//       builder
//          .addCase(createEmployee.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(createEmployee.fulfilled, (state, action) => {
//             state.loading = false;
//             if (action.payload) {
//                state.employees.push(action.payload);
//             }
//          })
//          .addCase(createEmployee.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          })

//       // Update employee
//       builder
//          .addCase(updateEmployee.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(updateEmployee.fulfilled, (state, action) => {
//             state.loading = false;
//             if (action.payload) {
//                const index = state.employees.findIndex(e => e.employee_id === action.payload?.employee_id);
//                if (index !== -1) {
//                   state.employees[index] = action.payload;
//                }
//             }
//          })
//          .addCase(updateEmployee.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          })

//       // Delete employee
//       builder
//          .addCase(deleteEmployee.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(deleteEmployee.fulfilled, (state, action) => {
//             state.loading = false;
//             state.employees = state.employees.filter(e => e.employee_id !== action.payload);
//          })
//          .addCase(deleteEmployee.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//    },
// });

// // Actions
// export const { 
//    clearEmployees, 
//    setSelectedEmployee, 
//    setEmployeeInfo, 
//    clearEmployeeInfo, 
//    clearError 
// } = employeeSlice.actions;

// // Selectors
// export const selectEmployees = (state: RootState) => state.employee.employees;
// export const selectSelectedEmployee = (state: RootState) => state.employee.selectedEmployee;
// export const selectEmployeeInfo = (state: RootState) => state.employee.employeeInfo;
// export const selectEmployeeLoading = (state: RootState) => state.employee.loading;
// export const selectEmployeeError = (state: RootState) => state.employee.error;

// // Reducer
// export default employeeSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Employee } from '@/pages/management/employee/entity';

const initialState: {
   employees: Employee[];
   loading: boolean;
   error: string | null;
} = {
   employees: [],
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
      setEmployeeSlice: (state, action: PayloadAction<Employee[]>) => {
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
const employeeSlice = createSlice({
   name: 'employees',
   initialState,
   reducers: {
      setEmployeesSlice: (state, action: PayloadAction<Employee[]>) => {
         state.employees = action.payload;
      },
      clearEmployees: (state) => {
         state.employees = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setEmployeeSlice, clearEmployees, setLoading, setError } = employeeSlice.actions;
export const employeeReducer = employeeSlice.reducer;

