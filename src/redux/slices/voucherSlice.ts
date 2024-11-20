// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { Voucher } from '@/pages/management/voucher/entity';
// import voucherAPI from '../api/services/voucherAPI';
// import { RootState } from '../stores/store';
// import { notification } from 'antd';

// // Types
// interface VoucherState {
//    vouchers: Voucher[];
//    selectedVoucher: Voucher | null;
//    loading: boolean;
//    error: string | null;
// }

// const initialState: VoucherState = {
//    vouchers: [],
//    selectedVoucher: null,
//    loading: false,
//    error: null,
// };

// // Async thunks
// export const fetchVouchers = createAsyncThunk(
//    'voucher/fetchVouchers',
//    async (_, { rejectWithValue }) => {
//       try {
//          const response = await voucherAPI.getVouchers();
//          if (response.success && response.data) {
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Không thể tải danh sách voucher');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// export const createVoucher = createAsyncThunk(
//    'voucher/createVoucher',
//    async (data: Omit<Voucher, 'voucher_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
//       try {
//          const response = await voucherAPI.createVoucher(data);
//          if (response.success && response.data) {
//             notification.success({ message: response.message || 'Tạo voucher thành công' });
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Tạo voucher thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// export const updateVoucher = createAsyncThunk(
//    'voucher/updateVoucher',
//    async (data: Partial<Voucher> & { voucher_id: number }, { rejectWithValue }) => {
//       try {
//          const response = await voucherAPI.updateVoucher(data);
//          if (response.success && response.data) {
//             notification.success({ message: response.message || 'Cập nhật voucher thành công' });
//             return response.data;
//          }
//          return rejectWithValue(response.message || 'Cập nhật voucher thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// export const deleteVoucher = createAsyncThunk(
//    'voucher/deleteVoucher',
//    async (voucherId: number, { rejectWithValue }) => {
//       try {
//          const response = await voucherAPI.deleteVoucher(voucherId);
//          if (response.success) {
//             notification.success({ message: response.message || 'Xóa voucher thành công' });
//             return voucherId;
//          }
//          return rejectWithValue(response.message || 'Xóa voucher thất bại');
//       } catch (error: any) {
//          return rejectWithValue(error.message);
//       }
//    }
// );

// // Slice
// const voucherSlice = createSlice({
//    name: 'voucher',
//    initialState,
//    reducers: {
//       clearVouchers: (state) => {
//          state.vouchers = [];
//       },
//       setSelectedVoucher: (state, action) => {
//          state.selectedVoucher = action.payload;
//       },
//       clearError: (state) => {
//          state.error = null;
//       },
//    },
//    extraReducers: (builder) => {
//       // Fetch vouchers
//       builder
//          .addCase(fetchVouchers.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(fetchVouchers.fulfilled, (state, action) => {
//             state.loading = false;
//             state.vouchers = action.payload;
//          })
//          .addCase(fetchVouchers.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          })

//       // Create voucher
//       builder
//          .addCase(createVoucher.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(createVoucher.fulfilled, (state, action) => {
//             state.loading = false;
//             if (action.payload) {
//                state.vouchers.push(action.payload);
//             }
//          })
//          .addCase(createVoucher.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          })

//       // Update voucher
//       builder
//          .addCase(updateVoucher.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(updateVoucher.fulfilled, (state, action) => {
//             state.loading = false;
//             if (action.payload) {
//                const index = state.vouchers.findIndex(v => v.voucher_id === action.payload?.voucher_id);
//                if (index !== -1) {
//                   state.vouchers[index] = action.payload;
//                }
//             }
//          })
//          .addCase(updateVoucher.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          })

//       // Delete voucher
//       builder
//          .addCase(deleteVoucher.pending, (state) => {
//             state.loading = true;
//             state.error = null;
//          })
//          .addCase(deleteVoucher.fulfilled, (state, action) => {
//             state.loading = false;
//             state.vouchers = state.vouchers.filter(v => v.voucher_id !== action.payload);
//          })
//          .addCase(deleteVoucher.rejected, (state, action) => {
//             state.loading = false;
//             state.error = action.payload as string;
//             notification.error({ message: action.payload as string });
//          });
//    },
// });

// // Actions
// export const { clearVouchers, setSelectedVoucher, clearError } = voucherSlice.actions;

// // Selectors
// export const selectVouchers = (state: RootState) => state.voucher.vouchers;
// export const selectSelectedVoucher = (state: RootState) => state.voucher.selectedVoucher;
// export const selectVoucherLoading = (state: RootState) => state.voucher.loading;
// export const selectVoucherError = (state: RootState) => state.voucher.error;

// // Reducer
// export const voucherReducer = voucherSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Voucher } from '@/pages/management/voucher/entity';

const initialState: {
   vouchers: Voucher[];
   loading: boolean;
   error: string | null;
} = {
   vouchers: [],
   loading: false,
   error: null,
};

const voucherSlice = createSlice({
   name: 'voucher',
   initialState,
   reducers: {
      setVouchersSlice: (state, action: PayloadAction<Voucher[]>) => {
         state.vouchers = action.payload;
      },
      clearVouchers: (state) => {
         state.vouchers = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setVouchersSlice, clearVouchers, setLoading, setError } = voucherSlice.actions;
export const voucherReducer = voucherSlice.reducer;
