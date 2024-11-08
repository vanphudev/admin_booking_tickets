import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import officeAPI from '../api/services/officeAPI';

const initialState: {
   offices: any[];
   loading: boolean;
   error: string | null;
} = {
   offices: [],
   loading: false,
   error: null,
};

export const fetchOffices = createAsyncThunk('office/getOffices', async () => {
   const response = await officeAPI.getOffices();
   return response;
});

const officeSlice = createSlice({
   name: 'office',
   initialState,
   reducers: {
      setOffices: (state, action: PayloadAction<any[]>) => {
         state.offices = action.payload;
      },
      clearOffices: (state) => {
         state.offices = [];
      },
   },
   extraReducers: (builder) => {
      builder.addCase(fetchOffices.pending, (state) => {
         state.loading = true;
      });
      builder.addCase(fetchOffices.fulfilled, (state, action) => {
         state.offices = action.payload.data;
         state.loading = false;
      });
      builder.addCase(fetchOffices.rejected, (state, action) => {
         state.error = action.error.message || null;
         state.loading = false;
      });
   },
});

export const { setOffices, clearOffices } = officeSlice.actions;
export const officeReducer = officeSlice.reducer;
