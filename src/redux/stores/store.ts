import { configureStore } from '@reduxjs/toolkit';

import { addressReducer } from '../slices/adressSlice';
import { officeReducer } from '../slices/officeSlice';
import { userReducer } from '../slices/userSlice';
import { paymentMethodReducer } from '../slices/paymentMethodSlice';
import { voucherReducer } from '../slices/voucherSlice';
import { articleReducer } from '../slices/articleSlice';
import { articleTypeReducer } from '../slices/articleTypeSlice';
import { vehicleReducer } from '../slices/vehicleSlice';
import { driverReducer } from '../slices/driverSlice';
import { employeeReducer } from '../slices/employeeSlice';

export const store = configureStore({
   reducer: {
      user: userReducer,
      office: officeReducer,
      address: addressReducer,
      paymentMethod: paymentMethodReducer,
      voucher: voucherReducer,
      article: articleReducer,
      articleType: articleTypeReducer,
      vehicle: vehicleReducer,
      driver: driverReducer,
      employee: employeeReducer,
   },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
