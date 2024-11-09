import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Driver } from '@/pages/management/driver/entity';
import driverAPI from '../api/services/driverAPI';

interface DriverState {
   drivers: Driver[];
   loading: boolean;
   error: string | null;
}

const initialState: DriverState = {
   drivers: [],
   loading: false,
   error: null,
};

export const fetchDrivers = createAsyncThunk('driver/getDrivers', async () => {
   const response = await driverAPI.getDrivers();
   return response;
});

const driverSlice = createSlice({
   name: 'driver',
   initialState,
   reducers: {
      setDrivers: (state, action: PayloadAction<Driver[]>) => {
         state.drivers = action.payload;
      },
      clearDrivers: (state) => {
         state.drivers = [];
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(fetchDrivers.pending, (state) => {
            state.loading = true;
         })
         .addCase(fetchDrivers.fulfilled, (state, action) => {
            state.drivers = action.payload;
            state.loading = false;
         })
         .addCase(fetchDrivers.rejected, (state, action) => {
            state.error = action.error.message || null;
            state.loading = false;
         });
   },
});

export const { setDrivers, clearDrivers } = driverSlice.actions;
export const driverReducer = driverSlice.reducer;
