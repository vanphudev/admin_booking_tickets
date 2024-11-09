import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleAPI from '../api/services/vehicleAPI';

const initialState: {
   vehicleTypes: any[];
   loading: boolean;
   error: string | null;
} = {
   vehicleTypes: [],
   loading: false,
   error: null,
};

export const fetchVehicleTypes = createAsyncThunk('vehicleType/getVehicleTypes', async () => {
   const response = await vehicleAPI.getVehicles();
   return response;
});

const vehicleTypeSlice = createSlice({
   name: 'vehicleType',
   initialState,
   reducers: {
      setVehicleTypes: (state, action: PayloadAction<any[]>) => {
         state.vehicleTypes = action.payload;
      },
      clearVehicleTypes: (state) => {
         state.vehicleTypes = [];
      },
   },
   extraReducers: (builder) => {
      builder.addCase(fetchVehicleTypes.pending, (state) => {
         state.loading = true;
      });
      builder.addCase(fetchVehicleTypes.fulfilled, (state, action) => {
         state.vehicleTypes = action.payload.data;
         state.loading = false;
      });
      builder.addCase(fetchVehicleTypes.rejected, (state, action) => {
         state.error = action.error.message || null;
         state.loading = false;
      });
   },
});

export const { setVehicleTypes, clearVehicleTypes } = vehicleTypeSlice.actions;
export const vehicleTypeReducer = vehicleTypeSlice.reducer;
