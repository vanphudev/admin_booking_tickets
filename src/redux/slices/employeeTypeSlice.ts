import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmployeeType } from '@/pages/management/employee/entity';

interface EmployeeTypeState {
   employeeTypes: EmployeeType[];
   loading: boolean;
   error: string | null;
}

const initialState: EmployeeTypeState = {
   employeeTypes: [],
   loading: false,
   error: null,
};

const employeeTypeSlice = createSlice({
   name: 'employeeType',
   initialState,
   reducers: {
      setEmployeeTypes: (state, action: PayloadAction<EmployeeType[]>) => {
         state.employeeTypes = action.payload;
      },
      clearError: (state) => {
         state.error = null;
      },
   },
});

export const { setEmployeeTypes, clearError } = employeeTypeSlice.actions;

export default employeeTypeSlice.reducer;
