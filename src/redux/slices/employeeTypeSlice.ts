import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmployeeType } from '@/pages/management/employeeType/entity';

const initialState: {
   employeeTypes: EmployeeType[];
   loading: boolean;
   error: string | null;
} = {
   employeeTypes: [],
   loading: false,
   error: null,
};

const employeeTypeSlice = createSlice({
   name: 'employeeType',
   initialState,
   reducers: {
      setEmployeeTypesSlice: (state, action: PayloadAction<EmployeeType[]>) => {
         state.employeeTypes = action.payload;
      },
      clearEmployeeTypes: (state) => {
         state.employeeTypes = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setEmployeeTypesSlice, clearEmployeeTypes, setLoading, setError } = employeeTypeSlice.actions;
export const employeeTypeReducer = employeeTypeSlice.reducer;
