import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { PaymentMethod } from '@/pages/management/method-payment/entity';
import paymentMethodAPI from '../api/services/paymentMethodAPI';

const initialState: {
   paymentMethods: PaymentMethod[];
   loading: boolean;
   error: string | null;
} = {
   paymentMethods: [],
   loading: false,
   error: null,
};

export const fetchPaymentMethods = createAsyncThunk('paymentMethod/getPaymentMethods', async () => {
   const response = await paymentMethodAPI.getPaymentMethods();
   return response;
});

const paymentMethodSlice = createSlice({
   name: 'paymentMethod',
   initialState,
   reducers: {
      setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
         state.paymentMethods = action.payload;
      },
      clearPaymentMethods: (state) => {
         state.paymentMethods = [];
      },
   },
   extraReducers: (builder) => {
      builder.addCase(fetchPaymentMethods.pending, (state) => {
         state.loading = true;
      });
      builder.addCase(fetchPaymentMethods.fulfilled, (state, action) => {
         state.paymentMethods = action.payload;
         state.loading = false;
      });
      builder.addCase(fetchPaymentMethods.rejected, (state, action) => {
         state.error = action.error.message || null;
         state.loading = false;
      });
   },
});

export const { setPaymentMethods, clearPaymentMethods } = paymentMethodSlice.actions;
export const paymentMethodReducer = paymentMethodSlice.reducer;
