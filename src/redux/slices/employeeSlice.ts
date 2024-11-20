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

const employeeSlice = createSlice({
   name: 'employee',
   initialState,
   reducers: {
      setEmployeeSlice: (state, action: PayloadAction<Employee[]>) => {
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
