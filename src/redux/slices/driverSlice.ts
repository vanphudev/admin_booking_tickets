import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Driver } from '@/pages/management/driver/entity';

const initialState: {
   drivers: Driver[];
   loading: boolean;
   error: string | null;
} = {
   drivers: [],
   loading: false,
   error: null,
};

const driverSlice = createSlice({
   name: 'driver',
   initialState,
   reducers: {
      setDriverSlice: (state, action: PayloadAction<Driver[]>) => {
         state.drivers = action.payload;
      },
      clearDrivers: (state) => {
         state.drivers = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setDriverSlice, clearDrivers, setLoading, setError } = driverSlice.actions;
export const driverReducer = driverSlice.reducer;
