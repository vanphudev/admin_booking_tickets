import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import paymentMethodAPI from '../api/services/paymentMethodAPI';

interface PaymentType {
   payment_type_id: number;
   payment_type_name: string;
}

const initialState: {
   paymentTypes: PaymentType[];
   loading: boolean;
   error: string | null;
} = {
   paymentTypes: [],
   loading: false,
   error: null,
};

export const fetchPaymentTypes = createAsyncThunk('paymentType/getPaymentTypes', async () => {
   const response = await paymentMethodAPI.getPaymentTypes();
   return response;
});

const paymentTypeSlice = createSlice({
   name: 'paymentType',
   initialState,
   reducers: {
      setPaymentTypes: (state, action: PayloadAction<PaymentType[]>) => {
         state.paymentTypes = action.payload;
      },
      clearPaymentTypes: (state) => {
         state.paymentTypes = [];
      },
   },
   extraReducers: (builder) => {
      builder.addCase(fetchPaymentTypes.pending, (state) => {
         state.loading = true;
      });
      builder.addCase(fetchPaymentTypes.fulfilled, (state, action) => {
         state.paymentTypes = action.payload;
         state.loading = false;
      });
      builder.addCase(fetchPaymentTypes.rejected, (state, action) => {
         state.error = action.error.message || null;
         state.loading = false;
      });
   },
});

export const { setPaymentTypes, clearPaymentTypes } = paymentTypeSlice.actions;
export const paymentTypeReducer = paymentTypeSlice.reducer;
